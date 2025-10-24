// services/stockService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

class StockService {
  // Récupérer tout le stock
  async getAllStock() {
    try {
      const response = await fetch(`${API_URL}/api/stock`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du stock');
      }

      return data;
    } catch (error) {
      console.error('Erreur getAllStock:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStockStats() {
    try {
      const response = await fetch(`${API_URL}/api/stock/stats`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des stats');
      }

      return data;
    } catch (error) {
      console.error('Erreur getStockStats:', error);
      throw error;
    }
  }

  // Rechercher dans le stock
  async searchStock(query) {
    try {
      const response = await fetch(`${API_URL}/api/stock/search?search=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la recherche');
      }

      return data;
    } catch (error) {
      console.error('Erreur searchStock:', error);
      throw error;
    }
  }

  // Récupérer le stock d'un produit
  async getStockByProduct(productId) {
    try {
      const response = await fetch(`${API_URL}/api/stock/product/${productId}`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du stock');
      }

      return data;
    } catch (error) {
      console.error('Erreur getStockByProduct:', error);
      throw error;
    }
  }

  // Mettre à jour le stock
  async updateStock(stockId, quantite, operation = 'set') {
    try {
      const response = await fetch(`${API_URL}/api/stock/${stockId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantite, operation })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du stock');
      }

      return data;
    } catch (error) {
      console.error('Erreur updateStock:', error);
      throw error;
    }
  }
}

export default new StockService();
