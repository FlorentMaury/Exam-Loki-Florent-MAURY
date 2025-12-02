// Barre de navigation avec authentification et liens basés sur le rôle.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  // Récupération de l'état d'authentification depuis localStorage.
  const isAuthenticated = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    // Suppression des données d'authentification.
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-bold">Boutique</Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Affichage du nom d'utilisateur si authentifié. */}
        {isAuthenticated && (
          <span className="font-semibold">
            Bienvenue, {username}
          </span>
        )}
        
        {/* Lien vers le panier avec le nombre d'articles. */}
        <Link to="/cart" className="relative hover:text-gray-200">
          <span>Panier</span>
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">
              {cart.length}
            </span>
          )}
        </Link>

        {/* Lien Admin pour les administrateurs. */}
        {isAuthenticated && userRole === 'admin' && (
          <Link to="/admin" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600">
            Admin
          </Link>
        )}
        
        {/* Liens Connexion / Déconnexion. */}
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="hover:text-gray-200">Connexion</Link>
            <Link to="/register" className="hover:text-gray-200">Inscription</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
            Déconnexion
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
