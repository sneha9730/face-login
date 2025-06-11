import React from 'react';

const FrontPage = () => {
  return (
    <div className="relative w-screen h-screen bg-gray-900 flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900" />
      </div>
      <div className="relative z-10 mb-6">
        <div className="text-5xl md:text-6xl font-extrabold text-white text-center">
          FaceAuth
        </div>
        <p className="text-lg md:text-xl text-gray-300 text-center mt-4">
          Secure authentication using Face Recognition
        </p>
      </div>

      <div className="relative z-10 flex space-x-4">
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => window.location.href = '/register'}
          className="px-6 py-3 bg-gray-100 text-blue-700 rounded-md shadow-md hover:bg-gray-200 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default FrontPage;