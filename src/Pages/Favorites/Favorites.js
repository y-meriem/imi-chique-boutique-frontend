// pages/Favorites.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Heart, ShoppingBag, AlertCircle, Sparkles, X } from 'lucide-react';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [hoveredColor, setHoveredColor] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/favoris`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des favoris');
      console.error('❌ Erreur favoris:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (produitId) => {

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/favoris/${produitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(favorites.filter(f => f.id !== produitId));
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const addToCart = (product, color, size) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemId = `${product.id}-${color?.id || 'default'}-${size || 'default'}`;
    
    const existingItemIndex = currentCart.findIndex(item => item.cartItemId === cartItemId);
    
    if (existingItemIndex !== -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        cartItemId,
        id: product.id,
        titre: product.titre,
        prix: getPrixFinal(product),
        prixOriginal: product.prix,
        image: getProductImage(product, color?.id),
        quantity: 1,
        quantiteStock: product.quantite,
        couleur: color ? { id: color.id, nom: color.couleur, code: color.code_couleur } : null,
        taille: size || null
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setSelectedProduct(null);
    setSelectedColor(null);
    setSelectedSize(null);
  };

  const getProductImage = (product, colorId = null) => {
    
    if (!product.images || product.images.length === 0) {
      return null;
    }
    
    if (colorId) {
      const colorImage = product.images.find(img => img.id_couleur === colorId);
      if (colorImage) {
        const url = `${API_URL}${colorImage.url_image}`;
        return url;
      }
    }
    
    const url = `${API_URL}${product.images[0].url_image}`;
    return url;
  };

  const getPrixFinal = (product) => {
    return product.promo ? product.prix - product.promo : product.prix;
  };

  const getRemise = (product) => {
    if (!product.promo || product.promo <= 0) return 0;
    return ((product.promo / product.prix) * 100).toFixed(0);
  };

  const handleColorHover = (productId, colorId) => {
    setHoveredColor(prev => ({ ...prev, [productId]: colorId }));
  };

  const handleColorLeave = (productId) => {
    setHoveredColor(prev => ({ ...prev, [productId]: null }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold text-lg">Chargement...</p>
            <p className="text-gray-400 text-sm mt-2">✨ Chargement des favoris ✨</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
              Mes Favoris
            </h1>
            <p className="text-gray-600">
              {favorites.length} {favorites.length > 1 ? 'produits' : 'produit'} dans vos favoris
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Aucun favori pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Ajoutez des produits à vos favoris pour les retrouver facilement !
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
              >
                Découvrir nos produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map((product) => {
                const currentColorId = hoveredColor[product.id];
                const imageUrl = getProductImage(product, currentColorId);
                const prixFinal = getPrixFinal(product);
                const remise = getRemise(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl border-2 border-pink-50"
                  >
                    {/* Image du produit */}
                    <div
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.titre}
                          className="w-full h-48 object-cover transition-all duration-300"
                          onError={(e) => {
                            console.error('❌ Erreur chargement image:', imageUrl);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-48 bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center text-6xl"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        📦
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.quantite > 0 && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            En Stock
                          </span>
                        )}
                        {remise > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            -{remise}%
                          </span>
                        )}
                      </div>

                      {/* Bouton cœur */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(product.id);
                        }}
                        className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                      >
                        <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
                      </button>

                      {/* Points de couleur */}
                      {product.couleurs && product.couleurs.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex gap-1">
                          {product.couleurs.slice(0, 5).map((couleur) => (
                            <button
                              key={couleur.id}
                              onMouseEnter={() => handleColorHover(product.id, couleur.id)}
                              onMouseLeave={() => handleColorLeave(product.id)}
                              className={`w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125 ${
                                currentColorId === couleur.id ? 'ring-2 ring-pink-400' : ''
                              }`}
                              style={{ backgroundColor: couleur.code_couleur }}
                              title={couleur.couleur}
                            />
                          ))}
                          {product.couleurs.length > 5 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              +{product.couleurs.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Infos produit */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 mb-1 text-sm leading-tight line-clamp-2 h-10">
                        {product.titre}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {product.description || 'Produit de qualité'}
                      </p>

                      {/* Tailles */}
                      {product.tailles && product.tailles.length > 0 && (
                        <div className="flex gap-1 mb-3 flex-wrap">
                          {product.tailles.slice(0, 4).map((size, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-pink-50 text-pink-600 rounded-lg font-medium">
                              {size}
                            </span>
                          ))}
                          {product.tailles.length > 4 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                              +{product.tailles.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Prix et bouton */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent">
                            {prixFinal} DA
                          </span>
                          {remise > 0 && (
                            <span className="block text-xs line-through text-gray-400">
                              {product.prix} DA
                            </span>
                          )}
                        </div>
                      <button
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  }}
  className="bg-gradient-to-r  from-pink-500 via-[#f77fbe] to-pink-300  text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all hover:shadow-xl hover:scale-105 flex items-center gap-1"
>
  <Sparkles className="w-4 h-4" />
  Plus de détails
</button>

                      </div>

                      {/* Stock */}
                      <div className="text-xs">
                        {product.quantite > 0 ? (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {product.quantite} en stock
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Épuisé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal sélection couleur/taille */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedProduct(null);
            setSelectedColor(null);
            setSelectedSize(null);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={getProductImage(selectedProduct, selectedColor?.id)}
                alt={selectedProduct.titre}
                className="w-full h-64 object-cover rounded-t-3xl"
              />
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedColor(null);
                  setSelectedSize(null);
                }}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:scale-110 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedProduct.titre}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent">
                  {getPrixFinal(selectedProduct)} DA
                </span>
                {getRemise(selectedProduct) > 0 && (
                  <span className="text-sm line-through text-gray-400">
                    {selectedProduct.prix} DA
                  </span>
                )}
              </div>

              {/* Couleurs */}
              {selectedProduct.couleurs && selectedProduct.couleurs.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Choisir une couleur {selectedColor && `- ${selectedColor.couleur}`}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.couleurs.map((couleur) => (
                      <button
                        key={couleur.id}
                        onClick={() => setSelectedColor(couleur)}
                        className={`relative w-12 h-12 rounded-full border-4 transition-all ${
                          selectedColor?.id === couleur.id 
                            ? 'border-pink-500 scale-110 shadow-lg' 
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                        style={{ backgroundColor: couleur.code_couleur }}
                        title={couleur.couleur}
                      >
                        {selectedColor?.id === couleur.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailles */}
              {selectedProduct.tailles && selectedProduct.tailles.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Choisir une taille
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.tailles.map((taille, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(taille)}
                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${
                          selectedSize === taille
                            ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white shadow-lg scale-105'
                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                        }`}
                      >
                        {taille}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProduct.description && (
                <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                  {selectedProduct.description}
                </p>
              )}

              {/* Bouton Ajouter */}
              <button
                onClick={() => {
                  if (selectedProduct.couleurs?.length > 0 && !selectedColor) {
                    alert('⚠️ Veuillez choisir une couleur');
                    return;
                  }
                  if (selectedProduct.tailles?.length > 0 && !selectedSize) {
                    alert('⚠️ Veuillez choisir une taille');
                    return;
                  }
                  
                  addToCart(selectedProduct, selectedColor, selectedSize);
                }}
                className="w-full bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Ajouter au panier
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Favorites;
