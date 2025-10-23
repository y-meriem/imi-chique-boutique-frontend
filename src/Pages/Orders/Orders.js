// src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Clock,TrendingUp, CheckCircle,XCircle, Package, Eye, Phone, MapPin, Calendar, DollarSign, Filter, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/orderService';

const STATUTS = [
  { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmee', label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  { value: 'livree', label: 'Livrée', color: 'bg-green-100 text-green-800' },
  { value: 'annulee', label: 'Annulée', color: 'bg-red-100 text-red-800' }
];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filtres de date
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'month', 'date'
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  // Ajoutez ces states après vos autres useState
const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [alertType, setAlertType] = useState('success');

// Ajoutez cette fonction après vos autres fonctions
const showSuccess = (message, type = 'success') => {
  setSuccessMessage(message);
  setAlertType(type);
  setShowSuccessAlert(true);
  setTimeout(() => {
    setShowSuccessAlert(false);
  }, 4000);
};



  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, selectedStatut, filterMode, selectedMonth, selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatut, filterMode, selectedMonth, selectedDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir la liste des mois disponibles
  const getAvailableMonths = () => {
    const months = new Set();
    orders.forEach(order => {
      const date = new Date(order.date_commande);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.nom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.prenom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.telephone.includes(searchTerm)
      );
    }

    // Filtre par statut
    if (selectedStatut) {
      filtered = filtered.filter(order => order.statut === selectedStatut);
    }

    // Filtre par mois
    if (filterMode === 'month' && selectedMonth) {
      filtered = filtered.filter(order => {
        const date = new Date(order.date_commande);
        const orderMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return orderMonth === selectedMonth;
      });
    }

    // Filtre par date
    if (filterMode === 'date' && selectedDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date_commande).toISOString().split('T')[0];
        return orderDate === selectedDate;
      });
    }

    setFilteredOrders(filtered);
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Calculer le total du mois/date sélectionné
  const getTotalForPeriod = () => {
    return filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  };
// Après la fonction getTotalForPeriod(), ajoutez :
const getRevenuForPeriod = () => {
  return filteredOrders
    .filter(order => order.statut === 'livree')
    .reduce((sum, order) => {
      const orderRevenu = order.articles?.reduce((articleSum, article) => {
        return articleSum + (parseFloat(article.revenu || 0) * article.quantite);
      }, 0) || 0;
      return sum + orderRevenu;
    }, 0);
};
 // Modifiez la fonction handleStatusChange
const handleStatusChange = async (orderId, newStatus) => {
  try {
    await orderService.updateOrderStatus(orderId, newStatus);
    
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, statut: newStatus } : order
    ));

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, statut: newStatus });
    }

    // Remplacez l'alert par :
    const statusMessages = {
      'en_attente': { msg: 'Commande mise en attente', type: 'warning' },
      'confirmee': { msg: 'Commande confirmée avec succès', type: 'confirm' },
      'livree': { msg: 'Commande marquée comme livrée', type: 'delivered' },
      'annulee': { msg: 'Commande annulée', type: 'cancel' },
      'retour': { msg: 'Commande marquée comme retournée', type: 'return' }
    };

    const status = statusMessages[newStatus] || { msg: 'Statut mis à jour', type: 'success' };
    showSuccess(status.msg, status.type);

  } catch (error) {
    showSuccess('Erreur lors de la mise à jour du statut', 'error');
  }
};

  const openOrderDetails = async (orderId) => {
    try {
      const order = await orderService.getOrderById(orderId);
      setSelectedOrder(order);
      setShowModal(true);
    } catch (error) {
      alert('❌ Erreur lors du chargement des détails');
    }
  };

  const getStatutBadge = (statut) => {
    const statutObj = STATUTS.find(s => s.value === statut);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statutObj?.color || 'bg-gray-100 text-gray-800'}`}>
        {statutObj?.label || statut}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatut('');
    setFilterMode('all');
    setSelectedMonth('');
    setSelectedDate('');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  const availableMonths = getAvailableMonths();

  return (
    <Layout>
      <div className="p-6">
   {/* Header */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
        <Package className="w-8 h-8 text-pink-500" />
        Gestion des Commandes
      </h1>
      <p className="text-gray-600 font-medium">
        Total: {filteredOrders.length} commande(s)
      </p>
    </div>
  </div>

  {/* Mode de filtre par date */}
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">Filtrer par période</label>
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => {
          setFilterMode('all');
          setSelectedMonth('');
          setSelectedDate('');
        }}
        className={`px-4 py-2 rounded-xl font-bold transition ${
          filterMode === 'all'
            ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Toutes les commandes
      </button>
      <button
        onClick={() => {
          setFilterMode('month');
          setSelectedDate('');
        }}
        className={`px-4 py-2 rounded-xl font-bold transition ${
          filterMode === 'month'
            ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Par Mois
      </button>
      <button
        onClick={() => {
          setFilterMode('date');
          setSelectedMonth('');
        }}
        className={`px-4 py-2 rounded-xl font-bold transition ${
          filterMode === 'date'
            ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Par Date
      </button>
    </div>
  </div>

  <div className="grid md:grid-cols-2 gap-4 mb-4">
    {/* Recherche */}
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Rechercher (N°, nom, téléphone)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>

    {/* Filtre statut */}
    <div className="relative">
      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <select
        value={selectedStatut}
        onChange={(e) => setSelectedStatut(e.target.value)}
        className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
      >
        <option value="">Tous les statuts</option>
        {STATUTS.map(statut => (
          <option key={statut.value} value={statut.value}>{statut.label}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Sélecteur de mois */}
  {filterMode === 'month' && (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">Sélectionner un mois</label>
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
        >
          <option value="">Choisir un mois...</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )}

  {/* Sélecteur de date */}
  {filterMode === 'date' && (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">Sélectionner une date</label>
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
        />
      </div>
    </div>
  )}

  {/* Bouton reset */}
  {(searchTerm || selectedStatut || filterMode !== 'all' || selectedMonth || selectedDate) && (
    <button
      onClick={resetFilters}
      className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1"
    >
      <X className="w-4 h-4" />
      Réinitialiser tous les filtres
    </button>
  )}
</div>

{/* Résumé de la période sélectionnée */}
{(filterMode === 'month' && selectedMonth) || (filterMode === 'date' && selectedDate) ? (
  <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold mb-1">
          {filterMode === 'month' 
            ? `Commandes de ${formatMonthLabel(selectedMonth)}`
            : `Commandes du ${new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
          }
        </h3>
        <p className="text-pink-100">{filteredOrders.length} commande(s) | {filteredOrders.filter(o => o.statut === 'livree').length} livrée(s)</p>
      </div>
      <div className="text-right space-y-2">
        <div>
          <p className="text-sm text-pink-100 mb-1">Total CA</p>
          <p className="text-3xl font-bold">{getTotalForPeriod().toFixed(2)} DA</p>
        </div>
        <div className="pt-2 border-t border-pink-300/30">
          <p className="text-sm text-pink-100 mb-1 flex items-center gap-1 justify-end">
            <TrendingUp className="w-4 h-4" />
            Revenu Net
          </p>
          <p className="text-2xl font-bold text-green-200">{getRevenuForPeriod().toFixed(2)} DA</p>
        </div>
      </div>
    </div>
  </div>
) : null}

{/* Stats rapides - 4 statuts */}
<div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-6">
  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-300/50 transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
    </div>
    <p className="text-3xl font-bold text-gray-800">
      {filteredOrders.filter(o => o.statut === 'en_attente').length}
    </p>
    <p className="text-sm font-medium mt-1 text-gray-600">En Attente</p>
  </div>

  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <CheckCircle className="w-8 h-8 text-blue-500 opacity-20" />
    </div>
    <p className="text-3xl font-bold text-gray-800">
      {filteredOrders.filter(o => o.statut === 'confirmee').length}
    </p>
    <p className="text-sm font-medium mt-1 text-gray-600">Confirmée</p>
  </div>

  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50 transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <Package className="w-8 h-8 text-green-500 opacity-20" />
    </div>
    <p className="text-3xl font-bold text-gray-800">
      {filteredOrders.filter(o => o.statut === 'livree').length}
    </p>
    <p className="text-sm font-medium mt-1 text-gray-600">Livrée</p>
  </div>

  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50 transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <XCircle className="w-8 h-8 text-red-500 opacity-20" />
    </div>
    <p className="text-3xl font-bold text-gray-800">
      {filteredOrders.filter(o => o.statut === 'retour' || o.statut === 'annulee').length}
    </p>
    <p className="text-sm font-medium mt-1 text-gray-600">Retour/Annulée</p>
  </div>
<div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-shadow">
  <div className="flex items-center justify-between mb-2">
    <TrendingUp className="w-8 h-8 text-emerald-500 opacity-20" />
  </div>
  <p className="text-3xl font-bold text-gray-800">
    {getRevenuForPeriod().toFixed(2)} DA
  </p>
  <p className="text-sm font-medium mt-1 text-gray-600">Revenu Net (Livrées)</p>
</div>
</div>
{/* Alert de succès */}
{showSuccessAlert && (
  <div className="mb-6 animate-slide-down">
    <div className={`border-2 rounded-2xl p-4 shadow-lg ${
      alertType === 'confirm' 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        : alertType === 'delivered'
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : alertType === 'cancel' || alertType === 'return'
        ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        : alertType === 'warning'
        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
        : alertType === 'error'
        ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          alertType === 'confirm'
            ? 'bg-blue-100'
            : alertType === 'delivered'
            ? 'bg-green-100'
            : alertType === 'cancel' || alertType === 'return'
            ? 'bg-red-100'
            : alertType === 'warning'
            ? 'bg-yellow-100'
            : alertType === 'error'
            ? 'bg-red-100'
            : 'bg-blue-100'
        }`}>
          {alertType === 'confirm' && <CheckCircle className="w-6 h-6 text-blue-600" />}
          {alertType === 'delivered' && <Package className="w-6 h-6 text-green-600" />}
          {alertType === 'cancel' && <XCircle className="w-6 h-6 text-red-600" />}
          {alertType === 'return' && <XCircle className="w-6 h-6 text-red-600" />}
          {alertType === 'warning' && <Clock className="w-6 h-6 text-yellow-600" />}
          {alertType === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm sm:text-base ${
            alertType === 'confirm'
              ? 'text-blue-800'
              : alertType === 'delivered'
              ? 'text-green-800'
              : alertType === 'cancel' || alertType === 'return'
              ? 'text-red-800'
              : alertType === 'warning'
              ? 'text-yellow-800'
              : alertType === 'error'
              ? 'text-red-800'
              : 'text-blue-800'
          }`}>
            {alertType === 'confirm' && '✅ Confirmée !'}
            {alertType === 'delivered' && '📦 Livrée !'}
            {alertType === 'cancel' && '❌ Annulée !'}
            {alertType === 'return' && '↩️ Retour !'}
            {alertType === 'warning' && '⏳ En attente !'}
            {alertType === 'error' && '❌ Erreur !'}
          </p>
          <p className={`text-xs sm:text-sm ${
            alertType === 'confirm'
              ? 'text-blue-700'
              : alertType === 'delivered'
              ? 'text-green-700'
              : alertType === 'cancel' || alertType === 'return'
              ? 'text-red-700'
              : alertType === 'warning'
              ? 'text-yellow-700'
              : alertType === 'error'
              ? 'text-red-700'
              : 'text-blue-700'
          }`}>
            {successMessage}
          </p>
        </div>
        <button
          onClick={() => setShowSuccessAlert(false)}
          className={`flex-shrink-0 transition p-1 ${
            alertType === 'confirm'
              ? 'text-blue-400 hover:text-blue-600'
              : alertType === 'delivered'
              ? 'text-green-400 hover:text-green-600'
              : alertType === 'cancel' || alertType === 'return'
              ? 'text-red-400 hover:text-red-600'
              : alertType === 'warning'
              ? 'text-yellow-400 hover:text-yellow-600'
              : alertType === 'error'
              ? 'text-red-400 hover:text-red-600'
              : 'text-blue-400 hover:text-blue-600'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
)}
        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Aucune commande trouvée</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {currentOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Info principale */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          Commande #{order.id}
                        </h3>
                        {getStatutBadge(order.statut)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {order.nom_client} {order.prenom_client}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {order.telephone}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {order.wilaya} - {order.commune}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.date_commande)}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent">
                        {order.total} DA
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <select
                        value={order.statut}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-sm font-medium"
                      >
                        {STATUTS.map(statut => (
                          <option key={statut.value} value={statut.value}>
                            {statut.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => openOrderDetails(order.id)}
                        className="bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages} ({filteredOrders.length} commande(s))
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl font-bold transition ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white hover:shadow-lg'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {/* Numéros de pages */}
                    <div className="hidden md:flex gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 rounded-xl font-bold transition ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="px-2 py-2 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-xl font-bold transition ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white hover:shadow-lg'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal détails */}
      {showModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Commande #{selectedOrder.id}</h2>
                  <p className="text-pink-100 text-sm mt-1">{formatDate(selectedOrder.date_commande)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white/20 backdrop-blur rounded-full p-2 hover:bg-white/30 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Informations client */}
              <div className="bg-pink-50 rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-pink-500" />
                  Informations client
                </h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-semibold">Nom:</span> {selectedOrder.nom_client} {selectedOrder.prenom_client}</p>
                  <p><span className="font-semibold">Téléphone:</span> {selectedOrder.telephone}</p>
                  <p><span className="font-semibold">Wilaya:</span> {selectedOrder.wilaya}</p>
                  <p><span className="font-semibold">Commune:</span> {selectedOrder.commune}</p>
                  <p className="md:col-span-2"><span className="font-semibold">Adresse:</span> {selectedOrder.adresse}</p>
                </div>
              </div>

              {/* Statut */}
              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-2">Statut de la commande</label>
                <select
                  value={selectedOrder.statut}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none font-medium"
                >
                  {STATUTS.map(statut => (
                    <option key={statut.value} value={statut.value}>
                      {statut.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Articles */}
          <div className="mb-6">
  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
    <Package className="w-5 h-5 text-pink-500" />
    Articles commandés ({selectedOrder.articles?.length || 0})
  </h3>
  <div className="space-y-3">
    {selectedOrder.articles?.map((article) => {
      const revenuArticle = parseFloat(article.revenu || 0) * article.quantite;
      const totalArticle = parseFloat(article.prix_unitaire) * article.quantite;
      
      return (
        <div key={article.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
          {/* Image */}
          {article.image && (
            <img 
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${article.image}`}
              alt={article.titre}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          
          {/* Info produit */}
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">{article.titre}</h4>
            
            {/* Variantes */}
            <div className="flex gap-2 items-center mt-1 text-sm text-gray-600">
              {article.couleur && (
                <span className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: article.code_couleur }}
                  />
                  {article.couleur}
                </span>
              )}
              {article.taille && (
                <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-medium">
                  {article.taille}
                </span>
              )}
            </div>
            
            {/* Prix, Quantité, Sous-total */}
            <div className="flex items-center justify-between mt-2 text-sm">
              <div className="flex gap-4 text-gray-600">
                <span>Prix: <span className="font-semibold text-gray-800">{article.prix_unitaire} DA</span></span>
                <span>Qté: <span className="font-semibold text-gray-800">{article.quantite}</span></span>
              </div>
              <span className="font-bold text-pink-600">{totalArticle.toFixed(2)} DA</span>
            </div>
            
            {/* Revenu si livré */}
            {selectedOrder.statut === 'livree' && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Revenu
                  </span>
                  <span className="font-bold text-emerald-600">{revenuArticle.toFixed(2)} DA</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
  
  {/* Total revenu si livré */}
  {selectedOrder.statut === 'livree' && (
    <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Revenu Net Total
        </span>
        <span className="text-xl font-bold text-emerald-600">
          {selectedOrder.articles?.reduce((sum, article) => {
            return sum + (parseFloat(article.revenu || 0) * article.quantite);
          }, 0).toFixed(2)} DA
        </span>
      </div>
    </div>
  )}
</div>

              {/* Total */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold text-gray-800 flex items-center gap-2">
                    Total
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent">
                    {selectedOrder.total} DA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
