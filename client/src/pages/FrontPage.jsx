import React from 'react';
import backgroundImage from '../assets/b1.jpg';

const FrontPage = () => {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative z-0 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-purple-500 mb-4">
          FaceAuth
        </h1>
        <p className="text-xl md:text-2xl text-purple-300 mb-8">
          Secure authentication using Face Recognition
        </p>
        <div className="flex space-x-4">
          <a
            href="/login"
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-white text-purple-600 rounded-md hover:bg-purple-100 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default FrontPage;