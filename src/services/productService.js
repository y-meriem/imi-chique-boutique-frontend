// services/productService.js

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

class ProductService {
  // Créer un nouveau produit
  async createProduct(productData, images, imageColors) {
  try {
    const formData = new FormData();

    // Ajouter les données du produit
    formData.append('titre', productData.titre);
    formData.append('description', productData.description);
    formData.append('revenu', productData.revenu);
    formData.append('prix', productData.prix);
    formData.append('promo', productData.promo || '');
    formData.append('categorie_id', productData.categorie_id);
    formData.append('statut', productData.statut);

    // Ajouter les couleurs
    formData.append('couleurs', JSON.stringify(productData.couleurs));

    // Ajouter les tailles
    formData.append('tailles', JSON.stringify(productData.tailles));
    formData.append('stock', JSON.stringify(productData.stock || {}));

    // Ajouter les images
    images.forEach((image) => {
      formData.append('images', image);
    });

    // Ajouter les couleurs des images
    formData.append('imageColors', JSON.stringify(imageColors));

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la création du produit');
    }

    return data;
  } catch (error) {
    console.error('Erreur createProduct:', error);
    throw error;
  }
}

  // Récupérer tous les produits
  async getAllProducts() {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des produits');
      }

      return data;
    } catch (error) {
      console.error('Erreur getAllProducts:', error);
      throw error;
    }
  }

  // Récupérer un produit par ID
 async getProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération du produit');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur getProductById:', error);
    throw error;
  }
}


  // Mettre à jour un produit
async updateProduct(id, productData, newImages, imageColors) {
  try {
    const formData = new FormData();

    // Ajouter les données du produit
    formData.append('titre', productData.titre);
    formData.append('description', productData.description);
    formData.append('revenu', productData.revenu);
    formData.append('prix', productData.prix);
    formData.append('promo', productData.promo || '');
    formData.append('categorie_id', productData.categorie_id);
    formData.append('statut', productData.statut);

    // Ajouter les couleurs
    formData.append('couleurs', JSON.stringify(productData.couleurs));

    // Ajouter les couleurs à supprimer
    formData.append('couleursToDelete', JSON.stringify(productData.couleursToDelete || []));

    // Ajouter les tailles
    formData.append('tailles', JSON.stringify(productData.tailles));
    formData.append('stock', JSON.stringify(productData.stock || {}));

    // Ajouter les images existantes
    formData.append('existingImages', JSON.stringify(productData.existingImages));

    // Ajouter les IDs des images à supprimer
    formData.append('imagesToDelete', JSON.stringify(productData.imagesToDelete));

    // Ajouter les nouvelles images
    newImages.forEach((image) => {
      formData.append('images', image);
    });

    // Ajouter les couleurs des nouvelles images
    formData.append('imageColors', JSON.stringify(imageColors));

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la mise à jour du produit');
    }

    return data;
  } catch (error) {
    console.error('Erreur updateProduct:', error);
    throw error;
  }
}

// Supprimer un produit
async deleteProduct(id) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });


    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la suppression du produit');
    }

    return data;
  } catch (error) {
    console.error('Erreur deleteProduct:', error);
    throw error;
  }
} 
}

export default new ProductService();
