// pages/admin/AvisManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/Layout';
import { Star, Check, X, Trash2, Eye, AlertCircle, Filter, MessageSquare, Calendar, User, Package, Mail, Search } from 'lucide-react';

const AvisManagement = () => {
  const navigate = useNavigate();
  const [avis, setAvis] = useState([]);
  const [filteredAvis, setFilteredAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvis, setSelectedAvis] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.type !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchAvis();
  }, []);

  useEffect(() => {
    filterAvis();
  }, [filterStatus, searchTerm, avis]);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/avis/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAvis(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des avis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAvis = () => {
    let filtered = avis;

    // Filtre par statut
    if (filterStatus !== 'tous') {
      filtered = filtered.filter(a => a.statut === filterStatus);
    }

    // Recherche par nom, email, produit ou commentaire
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.nom.toLowerCase().includes(search) ||
        a.email.toLowerCase().includes(search) ||
        (a.produit_titre && a.produit_titre.toLowerCase().includes(search)) ||
        a.commentaire.toLowerCase().includes(search)
      );
    }

    setFilteredAvis(filtered);
  };

  const openConfirmModal = (action, avisItem) => {
    setConfirmAction(action);
    setSelectedAvis(avisItem);
    setShowConfirmModal(true);
  };



 

  const handleConfirmAction = () => {
    if (!selectedAvis) return;

    switch (confirmAction) {
      case 'approve':
        updateStatut(selectedAvis.id, 'approuve');
        break;
      case 'reject':
        updateStatut(selectedAvis.id, 'rejete');
        break;
      case 'delete':
        deleteAvis(selectedAvis.id);
        break;
      default:
        break;
    }
  };

  const renderStars = (note) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < note ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente', icon: AlertCircle },
      approuve: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approuvé', icon: Check },
      rejete: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté', icon: X }
    };
    
    const badge = badges[statut] || badges.en_attente;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const stats = {
    total: avis.length,
    en_attente: avis.filter(a => a.statut === 'en_attente').length,
    approuve: avis.filter(a => a.statut === 'approuve').length,
    rejete: avis.filter(a => a.statut === 'rejete').length
  };
  const [successMessage, setSuccessMessage] = useState('');
const [showSuccessAlert, setShowSuccessAlert] = useState(false);

// Ajouter cette fonction pour afficher les alertes
const showSuccess = (message) => {
  setSuccessMessage(message);
  setShowSuccessAlert(true);
  setTimeout(() => {
    setShowSuccessAlert(false);
  }, 3000);
};

// Modifier la fonction updateStatut
const updateStatut = async (id, statut) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/avis/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ statut })
    });

    const data = await response.json();

    if (data.success) {
      fetchAvis();
      setShowModal(false);
      setShowConfirmModal(false);
      showSuccess(`Avis ${statut === 'approuve' ? 'approuvé' : 'rejeté'} avec succès`);
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
    console.error('Erreur mise à jour:', err);
    alert('❌ Erreur lors de la mise à jour');
  }
};

// Modifier la fonction deleteAvis
const deleteAvis = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/avis/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      fetchAvis();
      setShowConfirmModal(false);
      showSuccess('Avis supprimé avec succès');
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
    console.error('Erreur suppression:', err);
    alert('❌ Erreur lors de la suppression');
  }
};

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">Chargement des avis...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen p-4 sm:p-6">
        // et avant le div "max-w-7xl mx-auto"
{showSuccessAlert && (
  <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-4 flex items-center gap-3 max-w-md">
      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-6 h-6 text-green-600" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-sm">Succès !</p>
        <p className="text-gray-600 text-xs">{successMessage}</p>
      </div>
      <button
        onClick={() => setShowSuccessAlert(false)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
)}
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
                  Gestion des Avis
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Modérez et gérez les avis clients
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <p className="text-sm sm:text-base text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Total</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Attente</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.en_attente}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Approuvés</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.approuve}</p>
                  </div>
                  <Check className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Rejetés</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.rejete}</p>
                  </div>
                  <X className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 opacity-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              <span className="text-sm sm:text-base font-bold text-gray-800">Rechercher et Filtrer</span>
            </div>

            {/* Recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, produit ou commentaire..."
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

            {/* Filtres de statut */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'tous', label: 'Tous' },
                { key: 'en_attente', label: 'Attente' },
                { key: 'approuve', label: 'Approuvés' },
                { key: 'rejete', label: 'Rejetés' }
              ].map(status => (
                <button
                  key={status.key}
                  onClick={() => setFilterStatus(status.key)}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    filterStatus === status.key
                      ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  } active:scale-95`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des avis - Format Cards pour mobile */}
          <div className="space-y-4">
            {filteredAvis.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-base sm:text-lg font-medium">Aucun avis à afficher</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">
                  {filterStatus !== 'tous' 
                    ? `Aucun avis avec le statut "${filterStatus.replace('_', ' ')}"`
                    : "Les avis clients apparaîtront ici"
                  }
                </p>
              </div>
            ) : (
              filteredAvis.map((avisItem) => (
                <div key={avisItem.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  {/* Header de la carte */}
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-pink-600 flex-shrink-0" />
                          <p className="font-bold text-gray-800 truncate">{avisItem.nom}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <p className="truncate">{avisItem.email}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatutBadge(avisItem.statut)}
                      </div>
                    </div>
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-4 space-y-3">
                    {/* Produit */}
                    {avisItem.produit_titre && (
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Produit</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{avisItem.produit_titre}</p>
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <div className="flex gap-0.5">
                        {renderStars(avisItem.note)}
                      </div>
                    </div>

                    {/* Commentaire */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500">Commentaire</p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {avisItem.commentaire}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(avisItem.date_creation).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {avisItem.statut !== 'approuve' && (
                        <button
                          onClick={() => openConfirmModal('approve', avisItem)}
                          className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition flex items-center justify-center"
                          title="Approuver"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {avisItem.statut !== 'rejete' && (
                        <button
                          onClick={() => openConfirmModal('reject', avisItem)}
                          className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                          title="Rejeter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openConfirmModal('delete', avisItem)}
                        className="p-2.5 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition flex items-center justify-center"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Résumé */}
          {filteredAvis.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Affichage de {filteredAvis.length} sur {avis.length} avis
            </div>
          )}

        </div>
      </div>

      {/* Modal Confirmation */}
      {showConfirmModal && selectedAvis && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 rounded-t-2xl ${
              confirmAction === 'approve' ? 'bg-green-50' :
              confirmAction === 'reject' ? 'bg-red-50' :
              'bg-pink-50'
            }`}>
              <div className="flex items-center gap-3">
                {confirmAction === 'approve' && <Check className="w-8 h-8 text-green-600" />}
                {confirmAction === 'reject' && <X className="w-8 h-8 text-red-600" />}
                {confirmAction === 'delete' && <Trash2 className="w-8 h-8 text-pink-600" />}
                <h3 className="text-xl font-bold text-gray-800">
                  {confirmAction === 'approve' && 'Approuver l\'avis ?'}
                  {confirmAction === 'reject' && 'Rejeter l\'avis ?'}
                  {confirmAction === 'delete' && 'Supprimer l\'avis ?'}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold">Client :</span> {selectedAvis.nom}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  <span className="font-bold">Commentaire :</span> {selectedAvis.commentaire}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {confirmAction === 'approve' && 'Cet avis sera visible publiquement.'}
                {confirmAction === 'reject' && 'Cet avis sera masqué et marqué comme rejeté.'}
                {confirmAction === 'delete' && '⚠️ Cette action est irréversible !'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition hover:shadow-lg ${
                    confirmAction === 'approve' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    confirmAction === 'reject' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                    'bg-gradient-to-r from-pink-500 to-pink-600'
                  }`}
                >
                  {confirmAction === 'approve' && 'Approuver'}
                  {confirmAction === 'reject' && 'Rejeter'}
                  {confirmAction === 'delete' && 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails */}
      {showModal && selectedAvis && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  Détails de l'avis
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-pink-600" />
                    Client
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 font-medium">{selectedAvis.nom}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{selectedAvis.email}</p>
                </div>

                {selectedAvis.produit_titre && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-pink-600" />
                      Produit
                    </label>
                    <p className="text-sm sm:text-base text-gray-800 font-medium">
                      {selectedAvis.produit_titre}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-pink-600" />
                    Note
                  </label>
                  <div className="flex gap-1">
                    {renderStars(selectedAvis.note)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-pink-600" />
                    Commentaire
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    {selectedAvis.commentaire}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-pink-600" />
                      Date
                    </label>
                    <p className="text-xs sm:text-sm text-gray-800">
                      {new Date(selectedAvis.date_creation).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2 block">
                      Statut
                    </label>
                    {getStatutBadge(selectedAvis.statut)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {selectedAvis.statut !== 'approuve' && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      openConfirmModal('approve', selectedAvis);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Approuver
                  </button>
                )}
                {selectedAvis.statut !== 'rejete' && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      openConfirmModal('reject', selectedAvis);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Rejeter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AvisManagement;
