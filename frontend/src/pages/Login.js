// Page de connexion pour l'authentification des utilisateurs.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials
      );
      const { token, role, username } = response.data;

      // Stockage des données d'authentification dans localStorage.
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      navigate("/");
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        alert(message);
      } else {
        console.error("Erreur réseau:", error);
        alert("Une erreur s'est produite. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Nom d'utilisateur</label>
          <input
            type="text"
            placeholder="Entrez votre nom d'utilisateur"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Mot de passe</label>
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-3 w-full rounded font-semibold hover:bg-blue-600"
        >
          Connexion
        </button>
        <p className="text-center text-gray-600 mt-4">
          Pas de compte? <a href="/register" className="text-blue-500 hover:underline">Inscrivez-vous ici</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
