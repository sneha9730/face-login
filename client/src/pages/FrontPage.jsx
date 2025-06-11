import React from 'react';
import { Link } from 'react-router-dom';

const FrontPage = () => {
  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="mb-6">
        <div className="text-5xl md:text-6xl font-extrabold text-blue-600 text-center">
          FaceAuth
        </div>
        <p className="text-lg md:text-xl text-gray-600 text-center mt-4">
          Secure authentication using Face Recognition
        </p>
      </div>

      <div className="flex space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-gray-100 text-blue-700 rounded-md shadow-md hover:bg-gray-200 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default FrontPage;
