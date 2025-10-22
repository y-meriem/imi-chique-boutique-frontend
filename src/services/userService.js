import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configurer axios pour inclure le token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const userService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  // Connexion
 login: async (credentials) => {
  try {
    // credentials peut contenir { email, password } OU { telephone, password }
    const response = await axios.post(`${API_URL}/api/users/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
  }
},

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Mot de passe oublié
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la demande');
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  },
  // Mot de passe oublié par téléphone
forgotPasswordByPhone: async (telephone) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/forgot-password-phone`, { telephone });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la demande');
  }
},

  // Obtenir le profil
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, getAuthHeaders());
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  },

// Obtenir tous les utilisateurs (Admin)
getAllUsers: async () => {
  try {
    
    // ✅ APRÈS (CORRECT)
    const response = await axios.get(`${API_URL}/api/users`, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
  }
},

  // Obtenir un utilisateur par ID (Admin)
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${id}`, getAuthHeaders());
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Utilisateur non trouvé');
    }
  },

  // Mettre à jour un utilisateur (Admin)
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/${id}`, userData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  },
  // Mettre à jour le profil de l'utilisateur connecté
updateProfile: async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/profile`, userData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
  }
},

  // Supprimer un utilisateur (Admin)
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/users/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
