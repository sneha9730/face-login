from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import os
import uuid
from dotenv import load_dotenv
from tensorflow.keras.models import load_model
from deepface import DeepFace

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/faceauth")
mongo = PyMongo(app)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MODEL_PATH = 'deepface.h5'
face_classifier = None

if os.path.exists(MODEL_PATH):
    try:
        face_classifier = load_model(MODEL_PATH)
        print("✓ Face classifier model loaded successfully")
    except Exception as e:
        print(f"⚠️ Error loading face classifier model: {e}")
else:
    print(f"⚠️ Model file {MODEL_PATH} not found, using simple face matching")

def decode_base64_image(image_data):
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def get_face_embedding(img):
    temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{uuid.uuid4().hex}.jpg")
    cv2.imwrite(temp_path, img)
    
    try:
        embedding_result = DeepFace.represent(img_path=temp_path, model_name="Facenet", enforce_detection=False)
        embedding = embedding_result[0]["embedding"] if isinstance(embedding_result, list) else embedding_result["embedding"]
        os.remove(temp_path)
        return embedding
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise e

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    img_data = data.get('image')
    
    if not all([name, email, phone, img_data]):
        return jsonify({'success': False, 'message': 'Missing required data'}), 400
    existing_user = mongo.db.users.find_one({'email': email})
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    try:
        img = decode_base64_image(img_data)
        faces = face_cascade.detectMultiScale(img, 1.1, 4)
        
        if len(faces) == 0:
            return jsonify({'success': False, 'message': 'No face detected in the image'}), 400
        x, y, w, h = faces[0]
        face_img = img[y:y+h, x:x+w]
        face_img_resized = cv2.resize(face_img, (100, 100))
        filename = f"{uuid.uuid4().hex}.png"
        path = os.path.join(UPLOAD_FOLDER, filename)
        cv2.imwrite(path, face_img_resized)
        try:
            embedding = get_face_embedding(face_img)
            mongo.db.users.insert_one({
                'name': name,
                'email': email,
                'phone': phone,
                'photo': filename,
                'embedding': embedding
            })
            
            return jsonify({
                'success': True, 
                'message': 'User registered successfully',
                'user': {
                    'name': name,
                    'email': email,
                    'photo': filename
                }
            })
            
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error processing face: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    img_data = data.get('image')
    
    if not all([email, img_data]):
        return jsonify({'success': False, 'message': 'Missing email or image'}), 400
    user = mongo.db.users.find_one({'email': email})
    if not user:
        return jsonify({'success': False, 'message': 'Email not found'}), 404
    
    try:
        input_img = decode_base64_image(img_data)
        faces_input = face_cascade.detectMultiScale(input_img, 1.1, 4)
        
        if len(faces_input) == 0:
            return jsonify({'success': False, 'message': 'No face detected in the image'}), 400

        x, y, w, h = faces_input[0]
        face_input = input_img[y:y+h, x:x+w]
        face_input_resized = cv2.resize(face_input, (100, 100))
        
        authenticated = False
        confidence = 0
        
        if 'embedding' in user and face_classifier:
            input_embedding = get_face_embedding(face_input)
            input_embedding = np.array([input_embedding])
            stored_embedding = np.array(user['embedding'])
            similarity = 1 - np.mean(np.abs(input_embedding - stored_embedding)) / 2
            confidence = float(similarity)
    
            if confidence > 0.7: 
                authenticated = True
                
        else:
            stored_path = os.path.join(UPLOAD_FOLDER, user['photo'])
            if not os.path.exists(stored_path):
                return jsonify({'success': False, 'message': 'Stored image not found'}), 404
            
            stored_img = cv2.imread(stored_path)
            if stored_img is None:
                return jsonify({'success': False, 'message': 'Error loading stored image'}), 500
            
            stored_img_resized = cv2.resize(stored_img, (100, 100))
            
            error = np.mean((face_input_resized.astype("float") - stored_img_resized.astype("float")) ** 2)
            confidence = 1.0 - min(error / 10000, 1.0)
            
            if error < 3000:
                authenticated = True
        
        if authenticated:
            name_parts = user['name'].split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'id': str(user.get('_id')),
                'firstName': first_name,
                'lastName': last_name,
                'email': user['email'],
                'phone': user.get('phone', 'N/A'),
                'photo': user['photo'],
                'confidence': round(confidence * 100, 2)
            })
        
        return jsonify({
            'success': False, 
            'message': 'Face not recognized',
            'confidence': round(confidence * 100, 2)
        }), 401
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Authentication error: {str(e)}'}), 500

@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/status')
def status():
    model_status = "Available" if face_classifier else "Not loaded"
    return jsonify({
        'status': 'Server is running',
        'model_status': model_status
    })

if __name__ == '__main__':
    app.run(debug=True, port=9000)