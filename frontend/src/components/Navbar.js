// Navigation bar with user authentication and role-based links.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  // Get authentication state from localStorage.
  const isAuthenticated = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    // Remove authentication data.
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-bold">E-Commerce</Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Display username if authenticated. */}
        {isAuthenticated && (
          <span className="font-semibold">
            Hello, {username}
          </span>
        )}
        
        {/* Link to cart with item count. */}
        <Link to="/cart" className="relative hover:text-gray-200">
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">
              {cart.length}
            </span>
          )}
        </Link>

        {/* Admin link for administrators. */}
        {isAuthenticated && userRole === 'admin' && (
          <Link to="/admin" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600">
            Admin
          </Link>
        )}
        
        {/* Login / Logout links. */}
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="hover:text-gray-200">Login</Link>
            <Link to="/register" className="hover:text-gray-200">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
