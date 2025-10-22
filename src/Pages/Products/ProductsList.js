import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Eye, Search, Grid, List as ListIcon, Filter, X, ChevronDown, Package, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedColors, setSelectedColors] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setError('Erreur lors du chargement des produits');
      }
    } catch (err) {
      setError('Erreur de connexion à l\'API');
      console.error('Erreur fetch produits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Erreur catégories:', err);
    }
  };

  const handleDelete = async (id, titre) => {
  if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${titre}" ?`)) {
    try {
      setDeletingId(id);
      
      // ✅ Récupérer le token
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,  // ✅ AJOUT DU TOKEN
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
        setMessage({
          type: 'success',
          text: `✨ "${titre}" a été supprimé avec succès!`
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({
          type: 'error',
          text: `❌ Erreur: ${data.message || 'Impossible de supprimer le produit'}`
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: '❌ Erreur de connexion lors de la suppression'
      });
      console.error('Erreur suppression:', err);
    } finally {
      setDeletingId(null);
    }
  }
};

  const handleView = (id) => {
    // Navigation vers la page de détail du produit
     navigate(`/products/${id}`);
  };

  const handleEdit = (id) => {
    // Navigation vers la page d'édition du produit
    navigate(`/products/edit/${id}`);
  };

  const handleColorClick = (productId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }));
  };

  const getImageForColor = (product, color) => {
    if (!color || !product.images) return product.images?.[0];
    
    const colorImages = product.images.filter(img => img.id_couleur === color.id);
    if (colorImages.length > 0) {
      return colorImages[0];
    }
    return product.images[0];
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.categorie_id === parseInt(selectedCategory);
    const matchesStatus = filterStatus === 'all' || product.statut === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'price-asc': return a.prix - b.prix;
      case 'price-desc': return b.prix - a.prix;
      case 'stock-asc': return a.quantite - b.quantite;
      case 'stock-desc': return b.quantite - a.quantite;
      case 'name': return a.titre.localeCompare(b.titre);
      default: return b.id - a.id;
    }
  });

   const navigate = useNavigate();
// Fonction pour calculer le stock total
const calculateTotalStock = (product) => {
  if (!product.stock || product.stock.length === 0) return 0;
  return product.stock.reduce((total, s) => total + s.quantite, 0);
};

// Fonction pour calculer le stock pour une couleur spécifique
const getColorStock = (product, color) => {
  if (!product.stock || !color) return calculateTotalStock(product);
  
  const colorStock = product.stock.filter(s => s.id_couleur === color.id);
  return colorStock.reduce((total, s) => total + s.quantite, 0);
};

// ✅ NOUVELLE FONCTION: Vérifier si une couleur a du stock faible
const hasLowStockForColor = (product, color, threshold = 10) => {
  if (!product.stock || !color) return false;
  
  // Récupérer le stock pour cette couleur (tous tailles confondues)
  const colorStock = product.stock.filter(s => s.id_couleur === color.id);
  const totalColorStock = colorStock.reduce((total, s) => total + s.quantite, 0);
  
  return totalColorStock < threshold;
};

// ✅ NOUVELLE FONCTION: Compter les produits avec au moins une couleur en stock faible
const countProductsWithLowStockByColor = (products, threshold = 10) => {
  const productsWithLowStock = new Set();
  
  products.forEach(product => {
    if (product.couleurs && product.couleurs.length > 0) {
      const hasLowStock = product.couleurs.some(color => 
        hasLowStockForColor(product, color, threshold)
      );
      
      if (hasLowStock) {
        productsWithLowStock.add(product.id);
      }
    }
  });
  
  return productsWithLowStock.size;
};

// Dans le calcul des stats:
const lowStockCount = countProductsWithLowStockByColor(products, 10);

  const activeCount = products.filter(p => p.statut === 'actif').length;
  const inactiveCount = products.filter(p => p.statut === 'inactif').length;
  const withPromoCount = products.filter(p => p.promo > 0).length;

 

  return (
     <Layout>
      
       <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-pink-100">
          {/* Header - Mobile Optimized */}
   <div className="mb-6 sm:mb-8">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-pink-500 to-pink-300 p-3 rounded-2xl shadow-lg">
        <span className="text-2xl sm:text-3xl">🛍️</span>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">
          Mes Produits
        </h1>
      </div>
    </div>
     
    <button 
      onClick={() => navigate('/products/add')}
      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
    >
      <Plus size={20} />
      <span className="hidden sm:inline">Ajouter Produit</span>
      <span className="sm:hidden">Ajouter</span>
    </button>
  </div>
</div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message Notification */}
        {message.text && (
          <div 
            className={`mb-6 p-4 rounded-xl font-semibold shadow-lg animate-fade-in flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-500' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-l-4 border-red-500'
            }`}
          >
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        {/* Stats Cards - Améliorées */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-green-200 hover:border-green-400 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <TrendingUp className="text-green-600 opacity-50 group-hover:opacity-100 transition" size={20} />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">Produits Actifs</p>
            <p className="text-3xl font-black text-green-600">{activeCount}</p>
          </div>

          <div className="group bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-red-200 hover:border-red-400 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⏸️</span>
              <AlertCircle className="text-red-600 opacity-50 group-hover:opacity-100 transition" size={20} />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">Inactifs</p>
            <p className="text-3xl font-black text-red-600">{inactiveCount}</p>
          </div>

          <div className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏷️</span>
              <TrendingUp className="text-orange-600 opacity-50 group-hover:opacity-100 transition" size={20} />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">En Promotion</p>
            <p className="text-3xl font-black text-orange-600">{withPromoCount}</p>
          </div>

          <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-purple-200 hover:border-purple-400 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📦</span>
              <Package className="text-purple-600 opacity-50 group-hover:opacity-100 transition" size={20} />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">Stock Faible</p>
            <p className="text-3xl font-black text-purple-600">{lowStockCount}</p>
          </div>
        </div>

        {/* Barre de recherche et filtres - Version mobile optimisée */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-pink-100">
          {/* Recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition font-medium"
            />
          </div>

          {/* Bouton filtres mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-between bg-gradient-to-r from-pink-500 to-pink-300 text-white px-4 py-3 rounded-xl font-bold mb-3"
          >
            <span className="flex items-center gap-2">
              <Filter size={20} />
              Filtres {(selectedCategory || filterStatus !== 'all') && '(actifs)'}
            </span>
            <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={20} />
          </button>

          {/* Filtres */}
          <div className={`grid grid-cols-1 lg:grid-cols-4 gap-3 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-medium"
            >
              <option value="">📂 Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nom}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-medium"
            >
              <option value="all">📊 Tous statuts</option>
              <option value="actif">✅ Actifs</option>
              <option value="inactif">⏸️ Inactifs</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-medium"
            >
              <option value="newest">🆕 Plus récents</option>
              <option value="name">🔤 Nom A-Z</option>
              <option value="price-asc">💰 Prix croissant</option>
              <option value="price-desc">💰 Prix décroissant</option>
              <option value="stock-asc">📦 Stock croissant</option>
              <option value="stock-desc">📦 Stock décroissant</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 p-3 rounded-xl font-bold transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="mx-auto" size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 p-3 rounded-xl font-bold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ListIcon className="mx-auto" size={20} />
              </button>
            </div>
          </div>

          {/* Filtres actifs */}
          {(selectedCategory || filterStatus !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  {categories.find(c => c.id === parseInt(selectedCategory))?.nom}
                  <X size={14} className="cursor-pointer hover:text-pink-900" onClick={() => setSelectedCategory('')} />
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  {filterStatus === 'actif' ? '✅ Actifs' : '⏸️ Inactifs'}
                  <X size={14} className="cursor-pointer hover:text-pink-900" onClick={() => setFilterStatus('all')} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-pink-100">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-700 font-bold mb-2">Aucun produit trouvé</p>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW - Améliorée */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-pink-200"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-pink-100 via-pink-100 to-indigo-100 h-56 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`${API_URL}${getImageForColor(product, selectedColors[product.id])?.url_image}`}
                      alt={product.titre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl"
                    style={{ display: !product.images || product.images.length === 0 ? 'flex' : 'none' }}
                  >
                    📦
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.statut === 'actif' && (
                      <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                        ✅ Actif
                      </span>
                    )}
                    {product.statut === 'inactif' && (
                      <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                        ⏸️ Inactif
                      </span>
                    )}
                    {product.promo && product.promo > 0 && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm animate-pulse">
-{Math.round((product.promo / product.prix) * 100)}%                      </span>
                    )}
                  </div>

                  {/* Image Count */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold">
                      📷 {product.images.length}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-base group-hover:text-pink-600 transition">
                    {product.titre}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {product.description || 'Pas de description disponible'}
                  </p>

                  {/* Price and Stock */}
               <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-pink-50 to-pink-50 p-3 rounded-xl">
  <div>
    {product.promo && product.promo > 0 ? (
      <>
        {/* Ancien prix barré */}
        <p className="text-xs text-gray-400 line-through">
          {parseFloat(product.prix).toFixed(2)} DA
        </p>
        {/* Nouveau prix après réduction */}
        <p className="text-2xl font-black bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
          {(parseFloat(product.prix) - parseFloat(product.promo)).toFixed(2)} DA
        </p>
      </>
    ) : (
      // Pas de promo : afficher seulement le prix normal
      <p className="text-2xl font-black bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent">
        {parseFloat(product.prix).toFixed(2)} DA
      </p>
    )}
  </div>

  <div className="text-right">
    <p className="text-xs text-gray-600 font-semibold mb-1">Stock</p>
   {(() => {
  const selectedColor = selectedColors[product.id];
  const stock = selectedColor ? getColorStock(product, selectedColor) : calculateTotalStock(product);
  return (
    <p
      className={`text-2xl font-black ${
        stock > 10
          ? "text-green-600"
          : stock > 0
          ? "text-orange-600"
          : "text-red-600"
      }`}
    >
      {stock}
    </p>
  );
})()}
  </div>
</div>


                  {/* Colors */}
                  {product.couleurs && product.couleurs.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 font-semibold mb-2">Couleurs disponibles:</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.couleurs.slice(0, 6).map((c, i) => (
                          <button
                            key={i}
                            onClick={() => handleColorClick(product.id, c)}
                            className={`w-8 h-8 rounded-lg border-2 hover:scale-125 transition-all shadow-md ${
                              selectedColors[product.id]?.id === c.id
                                ? 'border-pink-600 ring-2 ring-offset-2 ring-pink-400'
                                : 'border-gray-300 hover:border-pink-400'
                            }`}
                            style={{ backgroundColor: c.code_couleur }}
                            title={c.couleur}
                          />
                        ))}
                        {product.couleurs.length > 6 && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-gray-400">
                            +{product.couleurs.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.tailles && product.tailles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 font-semibold mb-2">Tailles:</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.tailles.map((t, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-gradient-to-r from-pink-100 to-pink-100 text-pink-700 px-3 py-1.5 rounded-lg font-bold border border-pink-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleView(product.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-1 hover:scale-105 shadow-md"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Voir</span>
                    </button>
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-1 hover:scale-105 shadow-md"
                    >
                      <Edit2 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.titre)}
                      disabled={deletingId === product.id}
                      className="bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-1 hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Sup</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW - Améliorée */
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-4 border-2 border-transparent hover:border-pink-200 flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-100 to-pink-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`${API_URL}${getImageForColor(product, selectedColors[product.id])?.url_image}`}
                      alt={product.titre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center text-3xl"
                    style={{ display: !product.images || product.images.length === 0 ? 'flex' : 'none' }}
                  >
                    📦
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 line-clamp-1 text-base sm:text-lg group-hover:text-pink-600 transition">
                        {product.titre}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {product.description || 'Pas de description'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap flex-shrink-0">
                      {product.statut === 'actif' && (
                        <span className="bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">✅</span>
                      )}
                      {product.statut === 'inactif' && (
                        <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">⏸️</span>
                      )}
                      {product.promo && product.promo > 0 && (
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
-{Math.round((product.promo / product.prix) * 100)}%                       
 </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:gap-4 text-sm mb-3">
                    <span className="font-black bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                      💰 {product.prix}DA
                    </span>
                    {(() => {
  const selectedColor = selectedColors[product.id];
  const stock = selectedColor ? getColorStock(product, selectedColor) : calculateTotalStock(product);
  return (
    <span className={`font-bold ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
      📦 Stock: {stock}
    </span>
  );
})()}
                    {product.couleurs && product.couleurs.length > 0 && (
                      <span className="text-gray-600 font-semibold">🎨 {product.couleurs.length} couleurs</span>
                    )}
                    {product.tailles && product.tailles.length > 0 && (
                      <span className="text-gray-600 font-semibold">📏 {product.tailles.length} tailles</span>
                    )}
                    {product.images && product.images.length > 0 && (
                      <span className="text-gray-600 font-semibold">📷 {product.images.length} photos</span>
                    )}
                  </div>

                  {/* Colors preview */}
                  {product.couleurs && product.couleurs.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-600 font-semibold">Couleurs:</span>
                      <div className="flex gap-1.5">
                        {product.couleurs.slice(0, 8).map((c, i) => (
                          <button
                            key={i}
                            onClick={() => handleColorClick(product.id, c)}
                            className={`w-6 h-6 rounded-lg border-2 hover:scale-125 transition shadow-sm ${
                              selectedColors[product.id]?.id === c.id
                                ? 'border-purple-600 ring-2 ring-purple-400'
                                : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: c.code_couleur }}
                            title={c.couleur}
                          />
                        ))}
                        {product.couleurs.length > 8 && (
                          <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            +{product.couleurs.length - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 justify-center items-center">
                  <button
                    onClick={() => handleView(product.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition-all flex items-center justify-center hover:scale-110 shadow-md"
                    title="Voir le produit"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(product.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl transition-all flex items-center justify-center hover:scale-110 shadow-md"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.titre)}
                    disabled={deletingId === product.id}
                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all flex items-center justify-center hover:scale-110 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

     
    </div>
    </div>
  </Layout>
  );
};

export default ProductList;
