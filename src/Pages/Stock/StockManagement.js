// Pages/Stock/StockManagement.js
import React, { useState, useEffect } from 'react';
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, BarChart3, CheckCircle, X, Save } from 'lucide-react';
import stockService from '../../services/stockService';
import Layout from '../../components/layout/Layout';

const StockManagement = () => {
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState({});
  const [editingQuantities, setEditingQuantities] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStock();
  }, [stock, filter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockData, statsData] = await Promise.all([
        stockService.getAllStock(),
        stockService.getStockStats()
      ]);
      setStock(stockData.data);
      setFilteredStock(stockData.data);
      setStats(statsData.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStock = () => {
    let filtered = [...stock];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.produit_titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.couleur_nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'rupture') {
      filtered = filtered.filter(item => item.quantite === 0);
    } else if (filter === 'faible') {
      filtered = filtered.filter(item => item.quantite > 0 && item.quantite <= 10);
    } else if (filter === 'Disponible') {
      filtered = filtered.filter(item => item.quantite > 10);
    }

    setFilteredStock(filtered);
  };

  const updateQuantity = async (id, change) => {
    const item = stock.find(s => s.id === id);
    const newQuantity = Math.max(0, item.quantite + change);
    
    setUpdating(prev => ({ ...prev, [id]: true }));
    
    try {
      await stockService.updateStock(id, newQuantity, 'set');
      await loadData();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const setQuantity = async (id, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    
    setUpdating(prev => ({ ...prev, [id]: true }));
    
    try {
      await stockService.updateStock(id, newValue, 'set');
      await loadData();
      setEditingQuantities(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleQuantityChange = (id, value) => {
    setEditingQuantities(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const getStockStatus = (quantite) => {
    if (quantite === 0) {
      return { text: 'Rupture', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    } else if (quantite <= 10) {
      return { text: 'Faible', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle };
    } else {
      return { text: 'Disponible', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-2 sm:gap-3">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
                  Gestion du Stock
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Ajustez rapidement vos quantités
                </p>
              </div>
            </div>

            {/* Statistiques */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-1">Total</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total_variants}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-1">En Stock</p>
                      <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.stock_ok}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 opacity-20" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-300/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-1">Faible</p>
                      <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.stock_faible}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 opacity-20" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-1">Rupture</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.rupture_stock}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 opacity-20" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recherche */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              <span className="text-sm sm:text-base font-bold text-gray-800">Rechercher</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit ou couleur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition text-sm ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('Disponible')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition text-sm ${
                  filter === 'Disponible' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Disponible
              </button>
              <button
                onClick={() => setFilter('faible')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition text-sm ${
                  filter === 'faible' 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Faible
              </button>
              <button
                onClick={() => setFilter('rupture')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition text-sm ${
                  filter === 'rupture' 
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Rupture
              </button>
            </div>
          </div>

          {/* Liste des Produits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredStock.map((item) => {
              const status = getStockStatus(item.quantite);
              const StatusIcon = status.icon;
              const isUpdating = updating[item.id];

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {item.produit_image ? (
                        <img
                          src={`http://localhost:5000${item.produit_image}`}
                          alt={item.produit_titre}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info Produit */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate mb-1 text-sm sm:text-base">{item.produit_titre}</h3>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: item.code_couleur }}
                        />
                        <span className="text-xs sm:text-sm text-gray-600">{item.couleur_nom}</span>
                        <span className="text-xs sm:text-sm text-gray-400">•</span>
                        <span className="text-xs sm:text-sm text-gray-600">{item.taille || 'Unique'}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-base sm:text-lg font-bold text-pink-600">{Math.floor(item.produit_prix)} DA</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.text}
                        </span>
                      </div>

                      {/* Contrôles Quantité */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={isUpdating || item.quantite === 0}
                          className="p-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <input
                          type="number"
                          value={editingQuantities[item.id] !== undefined ? editingQuantities[item.id] : item.quantite}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          disabled={isUpdating}
                          className="w-16 sm:w-20 px-2 sm:px-3 py-2 text-center text-base sm:text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-pink-400 focus:outline-none disabled:bg-gray-100"
                          min="0"
                        />
                        
                        {editingQuantities[item.id] !== undefined && editingQuantities[item.id] !== item.quantite.toString() && (
                          <button
                            onClick={() => setQuantity(item.id, editingQuantities[item.id])}
                            disabled={isUpdating}
                            className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={isUpdating}
                          className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => updateQuantity(item.id, 10)}
                          disabled={isUpdating}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm rounded-lg hover:shadow-lg active:scale-95 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +10
                        </button>
                      </div>
                      
                      {isUpdating && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-pink-500"></div>
                          Mise à jour...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStock.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun stock trouvé</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StockManagement;
