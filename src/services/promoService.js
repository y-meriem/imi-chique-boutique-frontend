import axios from 'axios';


const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Fonction pour récupérer les headers d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const promoService = {
  // Vérifier un code promo (PUBLIC - pas besoin d'auth)
  async verifyCode(code) {
    try {
      const response = await axios.post(`${API_URL}/promo/verify`, { code });
      return response.data;
    } catch (error) {
      console.error('Erreur verifyCode:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de la vérification du code promo' };
    }
  },

  // Récupérer tous les codes promo (ADMIN - nécessite auth)
  async getAllPromos() {
    try {
      const response = await axios.get(`${API_URL}/promo`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getAllPromos:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de la récupération des codes promo' };
    }
  },

  // Récupérer un code promo par ID (ADMIN - nécessite auth)
  async getPromoById(id) {
    try {
      const response = await axios.get(`${API_URL}/promo/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getPromoById:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Code promo non trouvé' };
    }
  },

  // Créer un code promo (ADMIN - nécessite auth)
  async createPromo(promoData) {
    try {
      const response = await axios.post(`${API_URL}/promo`, promoData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur createPromo:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de la création du code promo' };
    }
  },

  // Mettre à jour un code promo (ADMIN - nécessite auth)
  async updatePromo(id, promoData) {
    try {
      const response = await axios.put(`${API_URL}/promo/${id}`, promoData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur updatePromo:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du code promo' };
    }
  },

  // Supprimer un code promo (ADMIN - nécessite auth)
  async deletePromo(id) {
    try {
      const response = await axios.delete(`${API_URL}/promo/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur deletePromo:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de la suppression du code promo' };
    }
  },

  // Changer le statut d'un code promo (ADMIN - nécessite auth)
  async toggleStatus(id) {
    try {
      const response = await axios.patch(`${API_URL}/promo/${id}/toggle`, {}, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur toggleStatus:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors du changement de statut' };
    }
  },

  // Récupérer les statistiques d'un code promo (ADMIN - nécessite auth)
  async getPromoStats(id) {
    try {
      const response = await axios.get(`${API_URL}/promo/${id}/stats`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getPromoStats:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques' };
    }
  }
};
