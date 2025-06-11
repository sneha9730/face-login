import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestartingCamera, setIsRestartingCamera] = useState(false);

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
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setMessage("Could not access the camera. Please ensure it's connected and permissions are granted.");
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

  const retakePhoto = async () => {
    setIsRestartingCamera(true);
    setCapturedImage('');
    await startCamera();
    setIsRestartingCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
    if (!capturedImage) {
      setMessage("Please capture your photo first");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:9000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, image: capturedImage })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Login successful!");
        const userData = {
          id: data.id || "unknown",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "N/A",
          photo: data.photo || ""
        };
        onLogin(userData);
      } else {
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600">Login to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="flex justify-center">
              {isCapturing ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                    autoPlay
                    playsInline
                  />
                  <button
                    onClick={captureImage}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Take Photo
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                  />
                  <button
                    onClick={retakePhoto}
                    disabled={isRestartingCamera}
                    className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRestartingCamera ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isRestartingCamera ? 'Restarting...' : 'Retake'}
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 text-blue-700 pr-3 pl-3"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md ${message.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;