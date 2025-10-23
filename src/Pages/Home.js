// pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Heart, ShoppingBag, Star, Sparkles, Search, ChevronRight, TrendingUp,Moon, X } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [hoveredColor, setHoveredColor] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [showAllAvis, setShowAllAvis] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showAvisModal, setShowAvisModal] = useState(false);

  const [avisData, setAvisData] = useState({
    note: 0,
    nom: '',
    email: '',
    commentaire: ''
  });
  const [user, setUser] = useState(null);
  const [submittingAvis, setSubmittingAvis] = useState(false);

  const [generalAvis, setGeneralAvis] = useState([]);
  const [loadingAvis, setLoadingAvis] = useState(false);

// Ajouter cette fonction après fetchUser
const fetchGeneralAvis = async () => {
  try {
    setLoadingAvis(true);
    const response = await fetch(`${API_URL}/api/avis/general`);
    const data = await response.json();
    if (data.success) {
      setGeneralAvis(data.data);
    }
  } catch (err) {
    console.error('Erreur chargement avis:', err);
  } finally {
    setLoadingAvis(false);
  }
};
// Fonctions de gestion du stock
const getStockForColorAndSize = (product, color, size) => {
  if (!product.stock || !color) return 0;
  
  if (!size) {
    const colorStock = product.stock.filter(s => s.id_couleur === color.id);
    return colorStock.reduce((total, s) => total + s.quantite, 0);
  }
  
  const specificStock = product.stock.find(
    s => s.id_couleur === color.id && s.taille === size
  );
  
  return specificStock ? specificStock.quantite : 0;
};
const getTotalStock = (product) => {
  if (!product.stock || product.stock.length === 0) {
    return product.quantite || 0;
  }
  return product.stock.reduce((total, s) => total + s.quantite, 0);
};
const getStockStatusForColor = (product, color) => {
  if (!product.stock || !color) return { available: false, quantity: 0 };
  
  const colorStock = product.stock.filter(s => s.id_couleur === color.id);
  const totalQuantity = colorStock.reduce((total, s) => total + s.quantite, 0);
  
  return {
    available: totalQuantity > 0,
    quantity: totalQuantity,
    lowStock: totalQuantity > 0 && totalQuantity < 10
  };
};
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchUser();
    fetchFavorites();
     fetchGeneralAvis();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, products, searchTerm]);

  const fetchUser = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }
};

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Erreur catégories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        const activeProducts = data.data.filter(product => product.statut === 'actif');
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      } else {
        setError('Erreur lors du chargement des produits');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchFavorites = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_URL}/api/favoris`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      setFavorites(data.data.map(f => f.produit_id));
    }
  } catch (err) {
    console.error('Erreur favoris:', err);
  }
};

  const filterProducts = () => {
    let filtered = products;

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categorie_id === selectedCategory.id);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null); // Désélectionner si déjà sélectionné
    } else {
      setSelectedCategory(category);
      // Scroll vers les produits
      setTimeout(() => {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };


  const getProductImage = (product, colorId = null) => {
    if (!product.images || product.images.length === 0) return null;
    if (colorId) {
      const colorImage = product.images.find(img => img.id_couleur === colorId);
      if (colorImage) return `${API_URL}${colorImage.url_image}`;
    }
    return `${API_URL}${product.images[0].url_image}`;
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

 const addToCart = (product, color, size) => {
  // ✅ Calculer le stock disponible
  const availableStock = getStockForColorAndSize(product, color, size);
  
  if (availableStock === 0) {
    alert('❌ Ce produit est en rupture de stock');
    return;
  }
  
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
      quantiteStock: availableStock, // ✅ Utiliser le stock calculé
      couleur: color ? { id: color.id, nom: color.couleur, code: color.code_couleur } : null,
      taille: size || null
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(currentCart));
  window.dispatchEvent(new Event('cartUpdated'));
  
  setSelectedProduct(null);
  setSelectedColor(null);
  setSelectedSize(null);
  setShowSizeError(false);
};
  const handleSubmitAvis = async () => {
  if (avisData.note === 0) {
    alert('⚠️ Veuillez sélectionner une note');
    return;
  }
  
  if (!avisData.commentaire.trim()) {
    alert('⚠️ Veuillez écrire un commentaire');
    return;
  }

  // Si l'utilisateur n'est pas connecté, vérifier nom et email
  if (!user && (!avisData.nom.trim() || !avisData.email.trim())) {
    alert('⚠️ Veuillez remplir votre nom et email');
    return;
  }

  try {
    setSubmittingAvis(true);
    
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/avis`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        produit_id: null, // Avis général sur la boutique
        note: avisData.note,
        nom: avisData.nom,
        email: avisData.email,
        commentaire: avisData.commentaire
      })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('✅ Merci pour votre avis! Il sera publié après vérification.');
      setShowAvisModal(false);
      setAvisData({ note: 0, nom: '', email: '', commentaire: '' });
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
  } finally {
    setSubmittingAvis(false);
  }
};
const toggleFavorite = async (productId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('⚠️ Veuillez vous connecter pour ajouter aux favoris');
    navigate('/login');
    return;
  }

  try {
    const isFavorite = favorites.includes(productId);
    
    if (isFavorite) {
      // Retirer des favoris
      await fetch(`${API_URL}/api/favoris/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFavorites(favorites.filter(fav => fav !== productId));
    } else {
      // Ajouter aux favoris
      await fetch(`${API_URL}/api/favoris`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ produit_id: productId })
      });
      setFavorites([...favorites, productId]);
    }
  } catch (err) {
    console.error('Erreur favori:', err);
    alert('❌ Erreur lors de l\'ajout aux favoris');
  }
};

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-30 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold text-lg">Chargement...</p>
            <p className="text-gray-400 text-sm mt-2">✨ Magie en cours ✨</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-30 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Oups!</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-pink-300 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-36 h-36 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-10 w-28 h-28 bg-rose-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 animate-bounce" style={{animationDuration: '3s', animationDelay: '0s'}}>
                <Star className="w-8 h-8 text-pink-300 opacity-30" />
              </div>
              <div className="absolute top-1/3 right-1/4 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
                <Heart className="w-6 h-6 text-purple-300 opacity-30" />
              </div>
              <div className="absolute bottom-1/3 left-1/3 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}>
                <Sparkles className="w-7 h-7 text-blue-300 opacity-30" />
              </div>
              <div className="absolute top-1/2 right-1/3 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '0.5s'}}>
                <Moon className="w-6 h-6 text-indigo-300 opacity-30" />
              </div>
            </div>

        {/* Hero Banner */}
  <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
    <img 
     src={`${process.env.PUBLIC_URL}/logo.png`}

      alt="Imi Chique Boutique"
      className="w-full h-auto max-h-32 sm:max-h-36 md:max-h-40 lg:max-h-44 object-contain p-3 sm:p-4 md:p-5"
    />
  </div>
</div>

        {/* Search Bar */}
<div className="max-w-7xl mx-auto px-4 mb-6">
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
    <input
      type="text"
      placeholder="Rechercher un produit..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-12 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white/80 backdrop-blur shadow-md"
    />
    {/* Bouton pour effacer la recherche */}
    {searchTerm && (
      <button
        onClick={() => setSearchTerm('')}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
  
  {/* Résultats de recherche */}
  {searchTerm && (
    <div className="mt-2 text-sm text-gray-600">
      {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
    </div>
  )}
</div>

       {/* Categories Section */}
<div className="max-w-7xl mx-auto px-4 mb-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <TrendingUp className="w-6 h-6 text-pink-500" />
      Catégories
    </h2>
    {selectedCategory && (
      <button
        onClick={() => setSelectedCategory(null)}
        className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1"
      >
        <X className="w-4 h-4" />
        Tout afficher
      </button>
    )}
  </div>

  {/* Desktop: Grid, Mobile: Scroll horizontal */}
  <div className="lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-4 hidden">
    {categories.map((category) => (
      <button
        key={category.id}
        onClick={() => handleCategoryClick(category)}
        className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 ${
          selectedCategory?.id === category.id 
            ? 'ring-4 ring-pink-400 scale-105' 
            : ''
        }`}
      >
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          {category.image_url ? (
            <img 
              src={`${API_URL}${category.image_url}`}
              alt={category.nom}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl"
            style={{ display: category.image_url ? 'none' : 'flex' }}
          >
            🛍️
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Nom de la catégorie */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-base text-center drop-shadow-lg">
              {category.nom}
            </h3>
          </div>

          {/* Badge sélectionné */}
          {selectedCategory?.id === category.id && (
            <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ✓ Actif
            </div>
          )}
        </div>

        {/* Flèche */}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-full p-1 shadow-md group-hover:bg-pink-500 group-hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    ))}
  </div>

  {/* Mobile: Scroll horizontal */}
  <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
    <div className="flex gap-4 pb-2" style={{ minWidth: 'min-content' }}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category)}
          className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg active:scale-95 transition-all flex-shrink-0 w-40 ${
            selectedCategory?.id === category.id 
              ? 'ring-4 ring-pink-400 scale-105' 
              : ''
          }`}
        >
          {/* Image */}
          <div className="relative h-32 overflow-hidden">
            {category.image_url ? (
              <img 
                src={`${API_URL}${category.image_url}`}
                alt={category.nom}
                className="w-full h-full object-cover transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl"
              style={{ display: category.image_url ? 'none' : 'flex' }}
            >
              🛍️
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Nom de la catégorie */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-white font-bold text-sm text-center drop-shadow-lg">
                {category.nom}
              </h3>
            </div>

            {/* Badge sélectionné */}
            {selectedCategory?.id === category.id && (
              <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                ✓
              </div>
            )}
          </div>

          {/* Flèche */}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-full p-1 shadow-md">
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      ))}
    </div>
  </div>
</div>

        {/* Trust Badges */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border-2 border-pink-100">
              <div className="text-2xl mb-1">🚚</div>
              <p className="text-xs font-bold text-gray-700">Livraison</p>
              <p className="text-xs text-gray-500">58 Wilayas</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border-2 border-purple-100">
              <div className="text-2xl mb-1">💝</div>
              <p className="text-xs font-bold text-gray-700">Satisfaction</p>
              <p className="text-xs text-gray-500">100% garantie</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border-2 border-blue-100">
              <div className="text-2xl mb-1">✨</div>
              <p className="text-xs font-bold text-gray-700">Qualité</p>
              <p className="text-xs text-gray-500">Premium</p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div id="products-section" className="max-w-7xl mx-auto px-4 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-500" />
              {selectedCategory ? `${selectedCategory.nom}` : 'Tous les Produits'}
            </h3>
            <span className="text-sm text-gray-500 font-medium">{filteredProducts.length} produits</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg font-medium">Aucun produit trouvé</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedCategory 
                  ? `Pas de produits dans "${selectedCategory.nom}"` 
                  : 'Essayez une autre recherche'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const currentColorId = hoveredColor[product.id];
                const imageUrl = getProductImage(product, currentColorId);
                const prixFinal = getPrixFinal(product);
                const remise = getRemise(product);

                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl border-2 border-pink-50"
                  >
                    <div className="relative cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.titre}
                          className="w-full h-48 object-cover transition-all duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
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

                      {/* Favoris */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`}
                        />
                      </button>

                      {/* Color Dots */}
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

                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 mb-1 text-sm leading-tight line-clamp-2 h-10">
                        {product.titre}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {product.description || 'Produit de qualité'}
                      </p>
                      
                      {/* Sizes */}
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

                      <div className="flex items-center justify-between mb-2">
                       <div>
    <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
      {Math.floor(prixFinal)} DA
    </span>
    {remise > 0 && (
      <span className="block text-xs line-through text-gray-400">
        {Math.floor(product.prix)} DA
      </span>
    )}
  </div>
                      
          <button
  onClick={(e) => {
    e.stopPropagation();
    
    const totalStock = getTotalStock(product);
    
    if (totalStock > 0) {
      setSelectedProduct(product);
      setSelectedColor(product.couleurs?.[0] || null);
      setSelectedSize(null);
      setShowSizeError(false);
    }
  }}
  disabled={getTotalStock(product) === 0}
  className={`${
    getTotalStock(product) > 0
      ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 hover:shadow-xl hover:scale-105' 
      : 'bg-gray-300 cursor-not-allowed'
  } text-white rounded-full font-bold shadow-lg transition-all flex items-center justify-center gap-1
  
  /* 📱 Version Mobile */
  px-2 py-2 text-xs
  
  /* 💻 Version Desktop */
  lg:px-4 lg:py-2 lg:text-sm`}
>
  <ShoppingBag className="w-4 h-4 lg:w-4 lg:h-4" />
  <span className="hidden sm:inline">
    {getTotalStock(product) > 0 ? 'Ajouter' : 'Épuisé'}
  </span>
  {/* Texte court pour mobile */}
  <span className="sm:hidden">
    {getTotalStock(product) > 0 ? '+' : '✕'}
  </span>
</button>
                      </div>



                    </div>
                  </div>
                );
              })}
            </div>
          )}
              {/* Customer Reviews Section */}
{/* Customer Reviews Section - Dynamique */}
<div className="mt-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 border-2 border-pink-100">
  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
    Avis Clients
    {generalAvis.length > 0 && (
      <span className="text-sm font-normal text-gray-600">({generalAvis.length})</span>
    )}
  </h4>

  {loadingAvis ? (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mx-auto"></div>
      <p className="text-gray-600 mt-3">Chargement des avis...</p>
    </div>
  ) : generalAvis.length === 0 ? (
    <div className="text-center py-8 bg-white rounded-2xl">
      <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-600 font-medium mb-2">Aucun avis pour le moment</p>
      <p className="text-gray-400 text-sm">Soyez le premier à partager votre expérience ✨</p>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Afficher 3 avis par défaut, ou tous si showAllAvis = true */}
      {(showAllAvis ? generalAvis : generalAvis.slice(0, 3)).map((avis) => {
        // Couleurs aléatoires pour les avatars
        const colors = [
          "from-pink-400 to-rose-400",
          "from-purple-400 to-indigo-400",
          "from-blue-400 to-cyan-400",
          "from-green-400 to-emerald-400",
          "from-orange-400 to-amber-400",
          "from-red-400 to-pink-400"
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div key={avis.id} className="bg-white rounded-2xl p-4 shadow-md border border-pink-100 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${randomColor} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                  {avis.nom ? avis.nom[0].toUpperCase() : '?'}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 text-sm block">
                    {avis.nom || 'Client anonyme'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(avis.date_creation).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < avis.note 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {avis.commentaire}
            </p>
          </div>
        );
      })}

      {/* Bouton Afficher plus / Afficher moins */}
      {generalAvis.length > 3 && (
        <button 
          onClick={() => setShowAllAvis(!showAllAvis)}
          className="w-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 py-3 rounded-2xl font-bold hover:from-pink-200 hover:to-purple-200 transition-all flex items-center justify-center gap-2"
        >
          {showAllAvis ? (
            <>
              <ChevronRight className="w-5 h-5 rotate-90 transform" />
              Afficher moins
            </>
          ) : (
            <>
              Afficher plus ({generalAvis.length - 3})
              <ChevronRight className="w-5 h-5 -rotate-90 transform" />
            </>
          )}
        </button>
      )}
    </div>
  )}
</div>

          {/* Newsletter Section */}
    {/* Formulaire Avis - Version Fixe */}
{/* Formulaire Avis - Version Homogène */}
<div className="mt-8 bg-white rounded-3xl p-6 shadow-xl border-2 border-pink-50">
  {/* Header */}
  <div className="flex items-center justify-center gap-2 mb-6">
    <Star className="w-6 h-6 text-pink-500 fill-pink-500" />
    <h3 className="text-xl font-bold text-gray-800">Donnez Votre Avis</h3>
    <Sparkles className="w-6 h-6 text-pink-400" />
  </div>

  {/* Étoiles */}
  <div className="mb-6 text-center">
    <p className="text-sm font-medium text-gray-600 mb-3">Notez votre expérience</p>
    <div className="flex gap-2 justify-center items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setAvisData({...avisData, note: star})}
          className="hover:scale-110 transition-transform"
        >
          <Star 
            className={`w-8 h-8 ${
              star <= avisData.note 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
    {avisData.note > 0 && (
      <p className="text-sm text-pink-500 font-semibold mt-2">
        {avisData.note}/5 étoiles
      </p>
    )}
  </div>

  {/* Infos utilisateur */}
  {user ? (
    <div className="mb-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-pink-300 flex items-center justify-center text-white font-bold shadow-md">
        {user.prenom[0]}{user.nom[0]}
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">{user.prenom} {user.nom}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <input
        type="text"
        placeholder="Votre nom"
        value={avisData.nom}
        onChange={(e) => setAvisData({...avisData, nom: e.target.value})}
        className="px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-sm bg-white"
      />
      <input
        type="email"
        placeholder="Votre email"
        value={avisData.email}
        onChange={(e) => setAvisData({...avisData, email: e.target.value})}
        className="px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-sm bg-white"
      />
    </div>
  )}

  {/* Commentaire */}
  <textarea
    placeholder="Partagez votre expérience avec nous..."
    rows="3"
    value={avisData.commentaire}
    onChange={(e) => setAvisData({...avisData, commentaire: e.target.value})}
    className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-sm resize-none bg-white mb-4"
  ></textarea>

  {/* Bouton */}
  <button 
    onClick={handleSubmitAvis}
    disabled={submittingAvis}
    className="w-full bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
  >
    {submittingAvis ? (
      <>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        Envoi en cours...
      </>
    ) : (
      <>
        <Heart className="w-5 h-5" />
        Envoyer mon avis
        <Sparkles className="w-5 h-5" />
      </>
    )}
  </button>

  <p className="text-xs text-gray-500 text-center mt-3">
    Votre avis sera vérifié avant publication
  </p>
</div>
        </div>   
      </div>
      {/* Modal de sélection Couleur/Taille */}
   {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => {
            setSelectedProduct(null);
            setSelectedColor(null);
            setSelectedSize(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[80vh] sm:max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={getProductImage(selectedProduct, selectedColor?.id)}
                alt={selectedProduct.titre}
                className="w-full h-48 sm:h-64 object-cover rounded-t-2xl sm:rounded-t-3xl"
              />
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedColor(null);
                  setSelectedSize(null);
                }}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 backdrop-blur rounded-full p-1.5 sm:p-2 shadow-lg hover:scale-110 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-3 sm:p-6">
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                {selectedProduct.titre}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
                  {getPrixFinal(selectedProduct)} DA
                </span>
                {getRemise(selectedProduct) > 0 && (
                  <span className="text-xs sm:text-sm line-through text-gray-400">
                    {selectedProduct.prix} DA
                  </span>
                )}
              </div>

              {/* Sélection Couleur */}
              {selectedProduct.couleurs && selectedProduct.couleurs.length > 0 && (
                <div className="mb-5 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    Choisir une couleur {selectedColor && `- ${selectedColor.couleur}`}
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {selectedProduct.couleurs.map((couleur) => (
                      <button
                        key={couleur.id}
                        onClick={() => setSelectedColor(couleur)}
                        className={`relative w-10 sm:w-12 h-10 sm:h-12 rounded-full border-3 sm:border-4 transition-all ${
                          selectedColor?.id === couleur.id 
                            ? 'border-pink-500 scale-110 shadow-lg' 
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                        style={{ backgroundColor: couleur.code_couleur }}
                        title={couleur.couleur}
                      >
                        {selectedColor?.id === couleur.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full shadow-md"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélection Taille */}
              {/* Sélection Taille */}
{selectedProduct.tailles && selectedProduct.tailles.length > 0 && selectedColor && (
  <div className="mb-5 sm:mb-6">
    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
      Choisir une taille
    </label>
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {selectedProduct.tailles.map((taille, idx) => {
        const sizeStock = getStockForColorAndSize(selectedProduct, selectedColor, taille);
        const sizeAvailable = sizeStock > 0;
        
        return (
          <button
            key={idx}
            onClick={() => {
              setSelectedSize(taille);
              setShowSizeError(false);
            }}
            disabled={!sizeAvailable}
            className={`py-2 sm:py-3 px-1 sm:px-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
              selectedSize === taille
                ? 'bg-gradient-to-r from-pink-500 to-pink-300 text-white shadow-lg scale-105'
                : sizeAvailable
                ? 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title={sizeAvailable ? `${taille} - ${sizeStock} dispo` : `${taille} - Indisponible`}
          >
            {taille}
          </button>
        );
      })}
    </div>
    
    {/* Message d'erreur taille */}
    {showSizeError && (
      <p className="text-red-500 text-xs mt-2 font-semibold">
        ⚠️ Veuillez sélectionner une taille
      </p>
    )}
  </div>
)}

              {/* Description */}
              {selectedProduct.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 line-clamp-3">
                  {selectedProduct.description}
                </p>
              )}

              {/* Bouton Ajouter au panier */}
             <button
  onClick={() => {
    if (selectedProduct.couleurs?.length > 0 && !selectedColor) {
      alert('⚠️ Veuillez choisir une couleur');
      return;
    }
    if (selectedProduct.tailles?.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }
    
    addToCart(selectedProduct, selectedColor, selectedSize);
  }}
  className="w-full bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
>
  <ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5" />
  Ajouter au panier
  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
