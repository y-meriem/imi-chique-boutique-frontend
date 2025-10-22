// src/services/orderService.js

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
export const orderService = {
  // Créer une commande
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la création de la commande');
      }

      return data;
    } catch (error) {
      console.error('Erreur orderService.createOrder:', error);
      throw error;
    }
  },

  // Récupérer toutes les commandes (pour admin)
  getAllOrders: async () => {
    try {
         const response = await fetch(`${API_URL}/api/orders`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
   
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des commandes');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur orderService.getAllOrders:', error);
      throw error;
    }
  },

  // Récupérer une commande par ID
  getOrderById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: getAuthHeaders()
      });      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération de la commande');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur orderService.getOrderById:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (id, statut) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ statut }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du statut');
      }

      return data;
    } catch (error) {
      console.error('Erreur orderService.updateOrderStatus:', error);
      throw error;
    }
  },
};
