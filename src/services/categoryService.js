// frontend/src/services/categoryService.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/categories`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

const categoryService = {
  // Récupérer toutes les catégories (CORRIGÉ: ajout de l'authentification)
  getAllCategories: async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getAllCategories:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer une catégorie par ID (CORRIGÉ: ajout de l'authentification)
  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getCategoryById:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Créer une catégorie (avec image)
  createCategory: async (categoryData) => {
    try {
      const formData = new FormData();
      formData.append('nom', categoryData.nom);
      
      if (categoryData.image) {
        formData.append('image', categoryData.image);
      }
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur createCategory:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour une catégorie (avec image)
  updateCategory: async (id, categoryData) => {
    try {
      const formData = new FormData();
      formData.append('nom', categoryData.nom);
      
      if (categoryData.image) {
        formData.append('image', categoryData.image);
      }
      
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur updateCategory:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur deleteCategory:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  }

};

export default categoryService;
