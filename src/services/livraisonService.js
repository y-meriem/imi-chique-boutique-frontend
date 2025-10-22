import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Fonction helper pour gérer l'authentification optionnelle
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
};

export const livraisonService = {
  // Récupérer tous les tarifs de livraison
  getAllDeliveryRates: async () => {
    try {
      const response = await axios.get(`${API_URL}/livraisons`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur récupération tarifs');
    }
  },

  // Récupérer le tarif de livraison par wilaya
  getDeliveryRateByWilaya: async (wilaya) => {
    try {
      const response = await axios.get(`${API_URL}/livraisons/${encodeURIComponent(wilaya)}`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Tarif non trouvé');
    }
  },

  // Créer un nouveau tarif de livraison (Admin)
  createDeliveryRate: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/livraisons`, data, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur création tarif');
    }
  },

  // Mettre à jour un tarif de livraison (Admin)
  updateDeliveryRate: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/livraisons/${id}`, data, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur mise à jour tarif');
    }
  },

  // Supprimer un tarif de livraison (Admin)
  deleteDeliveryRate: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/livraisons/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur suppression tarif');
    }
  }
};
