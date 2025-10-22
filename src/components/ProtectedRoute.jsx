import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Si pas de token, rediriger vers login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle est requis, vérifier le rôle de l'utilisateur
  if (requiredRole && user) {
    const userData = JSON.parse(user);
    if (userData.type !== requiredRole) {
      return <Navigate to="/" replace />; // Rediriger vers home si pas le bon rôle
    }
  }

  // Si authentifié, afficher le composant
  return element;
};

export default ProtectedRoute;