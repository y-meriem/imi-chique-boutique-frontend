// pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Star, ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart, Check } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllAvis, setShowAllAvis] = useState(false);
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [avis, setAvis] = useState([]);
  const [showAvisModal, setShowAvisModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [avisData, setAvisData] = useState({
    note: 0,
    nom: '',
    email: '',
    commentaire: ''
  });
  const [user, setUser] = useState(null);
  const [submittingAvis, setSubmittingAvis] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchAvis();
    }
  }, [product]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      const token = localStorage.getItem('token');
      if (!token || !id) return;

      try {
        const response = await fetch(`${API_URL}/api/favoris/check/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setIsFavorite(data.isFavorite);
        }
      } catch (err) {
        console.error('Erreur vérification favoris:', err);
      }
    };

    if (product) {
      checkIfFavorite();
    }
  }, [product, id]);

  const fetchAvis = async () => {
    try {
      const response = await fetch(`${API_URL}/api/avis/produit/${id}`);
      const data = await response.json();
      if (data.success) {
        setAvis(data.data);
      }
    } catch (err) {
      console.error('Erreur avis:', err);
    }
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('⚠️ Veuillez vous connecter pour ajouter des favoris');
      navigate('/login');
      return;
    }

    setLoadingFavorite(true);
    
    try {
      if (isFavorite) {
        const response = await fetch(`${API_URL}/api/favoris/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setIsFavorite(false);
        }
      } else {
        const response = await fetch(`${API_URL}/api/favoris`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ produit_id: id })
        });
        const data = await response.json();
        
        if (data.success) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error('Erreur favoris:', err);
      alert('❌ Erreur lors de l\'opération');
    } finally {
      setLoadingFavorite(false);
    }
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
          produit_id: product.id,
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
        fetchAvis();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      console.error('Erreur avis:', err);
      alert('❌ Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmittingAvis(false);
    }
  };

  const renderStars = (note) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < note ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        if (data.data.couleurs && data.data.couleurs.length > 0) {
          setSelectedColor(data.data.couleurs[0]);
        }
      } else {
        setError('Produit non trouvé');
      }
    } catch (err) {
      setError('Erreur lors du chargement du produit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImagesForColor = () => {
    if (!product || !product.images) return [];

    if (!selectedColor) {
      return product.images;
    }

    const colorImages = product.images.filter(img => 
      img.id_couleur === selectedColor.id
    );

    if (colorImages.length === 0) {
      return product.images.filter(img => !img.id_couleur || img.id_couleur === null);
    }

    return colorImages;
  };

  const images = getImagesForColor();

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedSize(null); 
    setSelectedImageIndex(0);
  };

 const handleAddToCart = () => {
    if (product.couleurs && product.couleurs.length > 0 && !selectedColor) {
      alert('⚠️ Veuillez sélectionner une couleur');
      return;
    }
    
    if (product.tailles && product.tailles.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    // ✅ Utiliser currentStock au lieu de product.quantite
    if (currentStock === 0) {
      alert('❌ Ce produit est en rupture de stock');
      return;
    }
    
    setShowSizeError(false);
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemId = `${product.id}-${selectedColor?.id || 'default'}-${selectedSize || 'default'}`;
    const existingItemIndex = currentCart.findIndex(item => item.cartItemId === cartItemId);
    
    if (existingItemIndex !== -1) {
      const newQuantity = currentCart[existingItemIndex].quantity + quantity;
      
      // ✅ Comparer avec currentStock au lieu de product.quantite
      if (newQuantity <= currentStock) {
        currentCart[existingItemIndex].quantity = newQuantity;
      } else {
        alert(`⚠️ Stock insuffisant. Maximum: ${currentStock}`);
        return;
      }
    } else {
      const prixFinal = product.promo ? product.prix - product.promo : product.prix;
      const mainImage = images.length > 0 ? images[0] : null;
       
      currentCart.push({
        cartItemId,
        id: product.id,
        titre: product.titre,
        prix: prixFinal,
        prixOriginal: product.prix,
        image: mainImage ? `${API_URL}${mainImage.url_image}` : null,
        quantity: quantity,
        quantiteStock: currentStock, // ✅ Utiliser currentStock ici aussi
        couleur: selectedColor ? {
          id: selectedColor.id,
          nom: selectedColor.couleur,
          code: selectedColor.code_couleur
        } : null,
        taille: selectedSize || null
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  const handleGoBack = () => {
  if (user && user.type === 'admin') {
    navigate('/products');
  } else {
    navigate('/');
  }
  };

// Fonctions utilitaires pour le stock
const getStockForColorAndSize = (product, color, size) => {
  if (!product.stock || !color) return 0;
  
  // Si pas de taille sélectionnée, retourner le stock pour la couleur
  if (!size) {
    const colorStock = product.stock.filter(s => s.id_couleur === color.id);
    return colorStock.reduce((total, s) => total + s.quantite, 0);
  }
  
  // Sinon, retourner le stock pour couleur + taille
  const specificStock = product.stock.find(
    s => s.id_couleur === color.id && s.taille === size
  );
  
  return specificStock ? specificStock.quantite : 0;
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




const getCurrentStock = () => {
  if (!product || !selectedColor) return 0;
  return getStockForColorAndSize(product, selectedColor, selectedSize);
};

const colorStatus = selectedColor ? getStockStatusForColor(product, selectedColor) : null;
const currentStock = getCurrentStock();
const isAvailable = currentStock > 0;
  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-30 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-5 text-center max-w-sm">
            <p className="text-3xl mb-2">❌</p>
            <p className="text-gray-700 mb-4 text-sm">{error || 'Produit non trouvé'}</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-pink-500 to-pink-300 text-white px-4 py-2 rounded-lg font-bold hover:from-pink-500 hover:to-pink-700 transition text-sm"
            >
              Retour
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const mainImage = images.length > 0 ? images[selectedImageIndex] : null;
  const prixFinal = product.promo ? product.prix - product.promo : product.prix;
  const remise = product.promo ? ((product.promo / product.prix) * 100).toFixed(0) : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-30 to-indigo-50 py-2 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1 text-pink-600 font-bold mb-3 hover:text-pink-700 transition text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 bg-white rounded-xl shadow-lg p-3 sm:p-5 lg:p-6">
  <div className="flex flex-col gap-3">
    {/* Image principale */}
    <div className="relative rounded-2xl overflow-hidden group">
      <div className="aspect-square w-full">
        {mainImage ? (
          <img
            src={`${API_URL}${mainImage.url_image}`}
            alt={product.titre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-6xl">📦</div>
        )}
      </div>

      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        {product.statut === 'actif' && (
          <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            En stock
          </span>
        )}
        {product.promo && product.promo > 0 && (
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            -{remise}%
          </span>
        )}
      </div>

      {/* Navigation flèches (seulement si plusieurs images) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevImage} 
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-800 p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={handleNextImage} 
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-800 p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>

    {/* Miniatures */}
    {images.length > 1 && (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImageIndex(idx)}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
              idx === selectedImageIndex 
                ? 'border-pink-500 ring-2 ring-pink-200 shadow-md scale-105' 
                : 'border-gray-200 hover:border-pink-300 hover:shadow-sm'
            }`}
          >
            <img 
              src={`${API_URL}${img.url_image}`} 
              alt={`Vue ${idx + 1}`} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    )}

    {/* Indicateur de pagination */}
    {images.length > 1 && (
      <div className="flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImageIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === selectedImageIndex 
                ? 'w-8 bg-pink-500' 
                : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    )}
  </div>

  <div className="flex flex-col gap-3">
    <div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-tight">{product.titre}</h1>
        <button
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          className={`flex-shrink-0 p-2 rounded-full transition ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {loadingFavorite ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{product.description || 'Aucune description disponible'}</p>
    </div>

    <div className="bg-gradient-to-r from-pink-50 to-pink-30 p-3 rounded-lg border border-pink-200">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-pink-600">{prixFinal}DA</span>
        {product.promo && product.promo > 0 && (
          <span className="text-sm line-through text-gray-500">{parseFloat(product.prix).toFixed(2)}DA</span>
        )}
      </div>
      {product.promo && product.promo > 0 && (
        <p className="text-green-600 font-bold text-xs mt-0.5">💰 Économisez {product.promo}DA</p>
      )}
    </div>

    {product.couleurs && product.couleurs.length > 0 && (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">
      Couleur: <span className="text-pink-600">{selectedColor?.couleur}</span>
    </label>
    <div className="flex gap-3 flex-wrap">
      {product.couleurs.map((couleur) => {
        const status = getStockStatusForColor(product, couleur);
        
        return (
          <button
            key={couleur.id}
            onClick={() => handleColorSelect(couleur)}
            className="relative group"
            title={`${couleur.couleur}${status.available ? ` - ${status.quantity} dispo` : ' - Indisponible'}`}
          >
            <div
              className={`w-12 h-12 rounded-full border-3 transition-all ${
                selectedColor?.id === couleur.id 
                  ? 'border-gray-800 ring-4 ring-gray-300 scale-110' 
                  : 'border-gray-300 hover:border-pink-400'
              } ${!status.available ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: couleur.code_couleur }}
            />
            
            {/* Badge de disponibilité */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              status.available 
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}>
              {status.available ? '✓' : '✕'}
            </div>
            
            {/* Tooltip au survol */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {couleur.couleur}
                <br/>
                {status.available ? `${status.quantity} dispo` : 'Indisponible'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
    
    {/* Affichage du stock par couleur - Seulement si pas dispo */}
    {selectedColor && colorStatus && !colorStatus.available && (
      <div className="mt-3 p-3 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
        Indisponible pour le moment
      </div>
    )}
  </div>
)}

{product.tailles && product.tailles.length > 0 && selectedColor && (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">
      Taille {selectedSize && `(${selectedSize})`}
    </label>
    <div className="flex gap-2 flex-wrap">
      {product.tailles.map((size, idx) => {
        const sizeStock = getStockForColorAndSize(product, selectedColor, size);
        const sizeAvailable = sizeStock > 0;
        
        return (
          <button
            key={idx}
            onClick={() => {
                 setSelectedSize(size);
                 setShowSizeError(false); 
             }}
            disabled={!sizeAvailable}
            className={`px-4 py-2 rounded-lg font-bold transition text-sm ${
              selectedSize === size 
                ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white ring-2 ring-pink-200' 
                : sizeAvailable
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title={`${size}${sizeAvailable ? ` - ${sizeStock} dispo` : ' - Indisponible'}`}
          >
            {size}
          </button>
        );
      })}
    </div>
    
    {/* Affichage du stock pour couleur + taille - Seulement si pas dispo */}
    {selectedSize && !isAvailable && (
      <div className="mt-3 p-3 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
        Indisponible pour le moment
      </div>
    )}
  </div>
)}

{/* Affichage détaillé du stock - Seulement pour admin */}
{user && user.type === 'admin' && selectedColor && (
  <div className={`p-3 rounded-lg text-sm font-semibold border ${
    isAvailable 
      ? currentStock < 10
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200'
  }`}>
    {selectedSize ? (
      isAvailable 
        ? `Stock: ${currentStock} unité${currentStock > 1 ? 's' : ''}`
        : 'Rupture de stock'
    ) : (
      isAvailable 
        ? `Stock couleur: ${colorStatus.quantity} unité${colorStatus.quantity > 1 ? 's' : ''}`
        : 'Indisponible'
    )}
  </div>
)}

{/* Quantité - visible seulement si stock disponible */}
{isAvailable && (
  <div className={`grid ${user && user.type === 'admin' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">Quantité</label>
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))} 
          className="px-2.5 py-1 bg-white rounded hover:bg-gray-200 transition font-bold"
        >
          −
        </button>
        <span className="text-lg font-bold text-gray-800 w-6 text-center">{quantity}</span>
        <button 
          onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} 
          disabled={quantity >= currentStock} 
          className="px-2.5 py-1 bg-white rounded hover:bg-gray-200 transition font-bold disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>

    {user && user.type === 'admin' && (
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">Stock</label>
        <div className={`p-2 rounded-lg font-bold text-xs ${currentStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {currentStock > 0 ? `${currentStock} dispo` : 'Épuisé'}
        </div>
      </div>
    )}
  </div>
)}

{showSizeError && product.tailles?.length > 0 && !selectedSize && isAvailable && (
  <div className="p-3 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
    ⚠️ Veuillez sélectionner une taille
  </div>
)}

{/* Bouton Ajouter au panier - Glissé seulement si pas de stock */}
{!isAvailable ? (
  <div className="flex gap-2 mt-2">
    <button
      disabled
      className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-300 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span>Indisponible</span>
    </button>
    
    <button className="p-3 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all hover:scale-105 active:scale-95" title="Partager">
      <Share2 className="h-5 w-5" />
    </button>
  </div>
) : (
  <div className="flex gap-2 mt-2">
    <button
      onClick={handleAddToCart}
  
      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
        addedToCart
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
          : 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white hover:shadow-xl hover:scale-105 active:scale-95'
      }`}
    >
      {addedToCart ? (
        <>
          <Check className="h-5 w-5" />
          <span>Ajouté au panier !</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          <span>Ajouter au panier</span>
        </>
      )}
    </button>
    
    <button className="p-3 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all hover:scale-105 active:scale-95" title="Partager">
      <Share2 className="h-5 w-5" />
    </button>
  </div>
)}
  </div>
</div>
        </div>
      </div>
<div className="max-w-6xl mx-auto mt-6">
  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 sm:p-8 border-2 border-pink-100">
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h4 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          Avis Clients
          {avis.length > 0 && (
            <span className="text-sm font-normal text-gray-600">({avis.length})</span>
          )}
        </h4>
        {avis.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex text-lg">
              {renderStars(Math.round(avis.reduce((acc, a) => acc + a.note, 0) / avis.length))}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-800">
                {(avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm">/5</span>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => setShowAvisModal(true)}
        className="bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
      >
        Laisser un avis
      </button>
    </div>

    {/* Reviews List */}
    {avis.length === 0 ? (
      <div className="text-center py-8 bg-white rounded-2xl">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium mb-2">Aucun avis pour le moment</p>
        <p className="text-gray-400 text-sm">Soyez le premier à partager votre expérience ✨</p>
      </div>
    ) : (
      <div className="space-y-4">
        {/* Afficher 5 avis par défaut, ou tous si showAllAvis = true */}
        {(showAllAvis ? avis : avis.slice(0, 5)).map((avisItem) => {
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
            <div 
              key={avisItem.id} 
              className="bg-white rounded-2xl p-4 shadow-md border border-pink-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${randomColor} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                    {avisItem.nom ? avisItem.nom[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">
                      {avisItem.nom || 'Client anonyme'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(avisItem.date_creation).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < avisItem.note 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {avisItem.commentaire}
              </p>
            </div>
          );
        })}

        {/* Bouton Afficher plus / Afficher moins */}
        {avis.length > 5 && (
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
                Afficher plus ({avis.length - 5})
                <ChevronRight className="w-5 h-5 -rotate-90 transform" />
              </>
            )}
          </button>
        )}
      </div>
    )}
  </div>
</div>
      {showAvisModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAvisModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">⭐ Donner votre avis</h3>
                <button onClick={() => setShowAvisModal(false)} className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition">
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <div className="mb-6 p-3 bg-pink-50 rounded-lg flex items-center gap-3">
                {mainImage && <img src={`${API_URL}${mainImage.url_image}`} alt={product.titre} className="w-16 h-16 object-cover rounded-lg" />}
                <div>
                  <p className="font-bold text-gray-800 text-sm">{product.titre}</p>
                  <p className="text-xs text-gray-500">Votre avis sur ce produit</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Votre note {avisData.note > 0 && `(${avisData.note}/5)`}
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setAvisData({...avisData, note: star})}
                      className="hover:scale-110 transition-transform"
                    >
                      <span className={`text-4xl ${star <= avisData.note ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="mb-4 p-3 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Connecté en tant que:</span> {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Votre nom *</label>
                    <input
                      type="text"
                      placeholder="Ex: Sarah Martin"
                      value={avisData.nom}
                      onChange={(e) => setAvisData({...avisData, nom: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Votre email *</label>
                    <input
                      type="email"
                      placeholder="email@exemple.com"
                      value={avisData.email}
                      onChange={(e) => setAvisData({...avisData, email: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-sm"
                    />
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Votre commentaire *</label>
                <textarea
                  placeholder="Partagez votre expérience avec ce produit..."
                  rows="4"
                  value={avisData.commentaire}
                  onChange={(e) => setAvisData({...avisData, commentaire: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-sm resize-none"
                ></textarea>
              </div>

              <button 
                onClick={handleSubmitAvis}
                disabled={submittingAvis}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-300 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingAvis ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer mon avis'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Votre avis sera vérifié avant publication 💕
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetail;