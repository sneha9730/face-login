import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FaceRegistration = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState('');
  const [isCapturing, setIsCapturing] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage(
        "Could not access the camera. Please ensure it's connected and permissions are granted."
      );
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    setIsCapturing(false);

    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedImage('');
    startCamera();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setMessage('Please fill in all fields');
      return;
    }

    if (!capturedImage) {
      setMessage('Please capture your photo before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:9000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          image: capturedImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Registration successful!');
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-700">
          Create new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="w-full md:w-1/2 mb-6 md:mb-0">
                <div className="flex justify-center">
                  {isCapturing ? (
                    <div className="relative w-full">
                      <video
                        ref={videoRef}
                        className="w-full !h-80 md:!h-full bg-gray-200 rounded-lg object-cover"
                        autoPlay
                        playsInline
                      />
                      <button
                        type="button"
                        onClick={captureImage}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Take Photo
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-64 md:h-full bg-gray-200 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Retake
                      </button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 text-blue-700 pr-3 pl-3"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 text-blue-700 pr-3 pl-3"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 text-blue-700 pr-3 pl-3"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 text-blue-700 pr-3 pl-3"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md mt-6 ${
                  message.includes('successful')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-gray-800 font-medium">
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
