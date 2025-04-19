import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-xl bg-transparent shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-2 text-purple-700 font-bold text-lg">FaceAuth</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-purple-600">Welcome, {user?.firstName || 'User'}</span>
                <Link to="/dashboard" className="text-purple-600 hover:underline">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-purple-600 hover:underline">Login</Link>
                <Link to="/register" className="text-purple-600 hover:underline">Register</Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-purple-600 p-2 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <span className="block text-purple-600">Welcome, {user?.firstName || 'User'}</span>
              <Link to="/dashboard" className="block text-purple-600 hover:underline">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-purple-600 hover:underline">Login</Link>
              <Link to="/register" className="block text-purple-600 hover:underline">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
