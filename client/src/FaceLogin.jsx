import React, { useRef, useState, useEffect } from 'react';

const FaceLogin = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', designation: '' });
  const [result, setResult] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }).catch((err) => {
      console.error('Error accessing camera:', err);
    });
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    setCapturedImage(image);
    return image;
  };

  const captureAndLogin = () => {
    const image = captureImage();
    
    const email = prompt('Enter your email to login:');
    if (!email) {
      setResult('Email is required for login.');
      return;
    }
  
    setResult('Processing login...');
  
    fetch('http://localhost:9000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, image })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResult(
            <div>
              <p>Welcome, {data.name}!</p>
              <p>Email: {data.email}</p>
              <img src={`http://localhost:9000/uploads/${data.photo}`} alt="user" width="100" />
            </div>
          );
        } else {
          setResult(data.message);
        }
      })
      .catch(() => setResult('Error logging in.'));
  };
  

  const captureAndRegister = () => {
    captureImage();
    setShowForm(true);
  };

  const submitRegistration = () => {
    const { name, email, phone, designation } = formData;
    if (!name || !email || !phone || !designation) {
      setResult('Please fill in all fields.');
      return;
    }

    fetch('http://localhost:9000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, phone_number: phone, image: capturedImage })
    })
      .then(res => res.json())
      .then(data => setResult(data.success ? 'Registration successful!' : data.message))
      .catch(() => setResult('Registration failed.'));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Face Recognition Login</h1>
      <video ref={videoRef} width="320" height="240" autoPlay></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div>
        <button onClick={captureAndLogin}>Login</button>
        <button onClick={captureAndRegister}>Register</button>
      </div>
      {showForm && (
        <div style={{ marginTop: 20 }}>
          <input type="text" placeholder="Name" onChange={e => setFormData({ ...formData, name: e.target.value })} /><br />
          <input type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} /><br />
          <input type="text" placeholder="Phone Number" onChange={e => setFormData({ ...formData, phone: e.target.value })} /><br />
          <input type="text" placeholder="Designation" onChange={e => setFormData({ ...formData, designation: e.target.value })} /><br />
          <button onClick={submitRegistration}>Submit</button>
        </div>
      )}
      <div style={{ marginTop: 20, fontWeight: 'bold' }}>{result}</div>
    </div>
  );
};

export default FaceLogin;
