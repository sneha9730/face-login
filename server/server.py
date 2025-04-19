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

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/faceauth")
mongo = PyMongo(app)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def decode_base64_image(image_data):
    image_data = image_data.split(',')[1]
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    img_data = data.get('image')
    
    if not all([name, email, phone, img_data]):
        return jsonify({'success': False, 'message': 'Missing data'}), 400
    
    img = decode_base64_image(img_data)
    faces = face_cascade.detectMultiScale(img, 1.1, 4)
    
    if len(faces) == 0:
        return jsonify({'success': False, 'message': 'No face detected'}), 400
    
    x, y, w, h = faces[0]
    face_img = img[y:y+h, x:x+w]
    face_img_resized = cv2.resize(face_img, (100, 100))
    
    filename = f"{uuid.uuid4().hex}.png"
    path = os.path.join(UPLOAD_FOLDER, filename)
    cv2.imwrite(path, face_img_resized)
    
    mongo.db.users.insert_one({
        'name': name,
        'email': email,
        'phone': phone,  # Ensuring this key matches what the frontend expects
        'photo': filename
    })
    
    return jsonify({'success': True, 'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    img_data = data.get('image')
    
    if not all([email, img_data]):
        return jsonify({'success': False, 'message': 'Missing email or image'}), 400
    
    input_img = decode_base64_image(img_data)
    faces_input = face_cascade.detectMultiScale(input_img, 1.1, 4)
    
    if len(faces_input) == 0:
        return jsonify({'success': False, 'message': 'No face detected in the image'}), 400
    
    x, y, w, h = faces_input[0]
    face_input = input_img[y:y+h, x:x+w]
    face_input_resized = cv2.resize(face_input, (100, 100))
    
    user = mongo.db.users.find_one({'email': email})
    
    if not user:
        return jsonify({'success': False, 'message': 'Email not found'}), 404
    
    stored_path = os.path.join(UPLOAD_FOLDER, user['photo'])
    if not os.path.exists(stored_path):
        return jsonify({'success': False, 'message': 'Stored image not found'}), 404
    
    stored_img = cv2.imread(stored_path)
    if stored_img is None:
        return jsonify({'success': False, 'message': 'Error loading stored image'}), 500
    
    stored_img_resized = cv2.resize(stored_img, (100, 100))
    error = np.mean((face_input_resized.astype("float") - stored_img_resized.astype("float")) ** 2)
    
    # More lenient threshold for face matching
    if error < 3000:
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
            'photo': user['photo']
        })
    
    return jsonify({'success': False, 'message': 'Face not recognized'}), 401

@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/status')
def status():
    return jsonify({'status': 'Server is running'})

if __name__ == '__main__':
    app.run(debug=True, port=9000)