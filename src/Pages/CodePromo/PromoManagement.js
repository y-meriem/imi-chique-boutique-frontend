import React, { useState, useEffect } from 'react';
import { Sparkles, Check,Tag, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, TrendingUp, Calendar, Users, Search, X, AlertCircle } from 'lucide-react';
import { promoService } from '../../services/promoService';
import Layout from '../../components/layout/Layout';

export default function PromoManagement() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingPromo, setEditingPromo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertType, setAlertType] = useState('success'); 
  const [formData, setFormData] = useState({
    code: '',
    type: 'pourcentage',
    pourcentage_reduction: '',
    montant_reduction: '',
    date_debut: '',
    date_fin: '',
    utilisations_max: '',
    actif: 1
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      setLoading(true);
      const response = await promoService.getAllPromos();
      setPromos(response.data || response);
    } catch (error) {
      console.error('Erreur chargement promos:', error);
      alert('❌ Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'pourcentage',
      pourcentage_reduction: '',
      montant_reduction: '',
      date_debut: '',
      date_fin: '',
      utilisations_max: '',
      actif: 1
    });
    setErrors({});
    setEditingPromo(null);
  };

  const openModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        type: promo.pourcentage_reduction ? 'pourcentage' : 'montant',
        pourcentage_reduction: promo.pourcentage_reduction || '',
        montant_reduction: promo.montant_reduction || '',
        date_debut: promo.date_debut ? promo.date_debut.split('T')[0] : '',
        date_fin: promo.date_fin ? promo.date_fin.split('T')[0] : '',
        utilisations_max: promo.utilisations_max || '',
        actif: promo.actif
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) newErrors.code = 'Code requis';
    if (!formData.date_debut) newErrors.date_debut = 'Date de début requise';
    if (!formData.date_fin) newErrors.date_fin = 'Date de fin requise';
    
    if (formData.type === 'pourcentage') {
      if (!formData.pourcentage_reduction || formData.pourcentage_reduction <= 0 || formData.pourcentage_reduction > 100) {
        newErrors.pourcentage_reduction = 'Pourcentage entre 1 et 100';
      }
    } else {
      if (!formData.montant_reduction || formData.montant_reduction <= 0) {
        newErrors.montant_reduction = 'Montant doit être supérieur à 0';
      }
    }

    if (formData.date_fin && formData.date_debut && formData.date_fin < formData.date_debut) {
      newErrors.date_fin = 'Date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const promoData = {
        code: formData.code.toUpperCase(),
        pourcentage_reduction: formData.type === 'pourcentage' ? parseFloat(formData.pourcentage_reduction) : null,
        montant_reduction: formData.type === 'montant' ? parseFloat(formData.montant_reduction) : null,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        utilisations_max: formData.utilisations_max ? parseInt(formData.utilisations_max) : null,
        actif: formData.actif
      };

      if (editingPromo) {
  await promoService.updatePromo(editingPromo.id, promoData);
  showSuccess('Code promo mis à jour avec succès', 'blue');
} else {
  await promoService.createPromo(promoData);
  showSuccess('Code promo créé avec succès', 'green');
}

      loadPromos();
      closeModal();
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('❌ ' + (error.message || 'Erreur lors de la sauvegarde'));
    }
  };

  const handleDelete = async () => {
  try {
    await promoService.deletePromo(promoToDelete.id);
    showSuccess('Code promo supprimé avec succès', 'red');
    loadPromos();
    closeDeleteConfirm();
  } catch (error) {
    console.error('Erreur suppression:', error);
    alert('❌ ' + (error.message || 'Erreur lors de la suppression'));
  }
};

  const handleToggleStatus = async (id) => {
    try {
      await promoService.toggleStatus(id);
      loadPromos();
    } catch (error) {
      console.error('Erreur toggle:', error);
      alert('❌ Erreur lors du changement de statut');
    }
  };

  const filteredPromos = promos.filter(promo =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      'Actif': 'bg-green-100 text-green-700',
      'Inactif': 'bg-gray-100 text-gray-700',
      'Expiré': 'bg-red-100 text-red-700',
      'À venir': 'bg-blue-100 text-blue-700',
      'Épuisé': 'bg-orange-100 text-orange-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: promos.length,
    actifs: promos.filter(p => p.status === 'Actif').length,
    utilises: promos.reduce((sum, p) => sum + (p.utilisations_actuelles || 0), 0)
  };
 

const openDeleteConfirm = (promo) => {
  setPromoToDelete(promo);
  setShowDeleteConfirm(true);
};

const closeDeleteConfirm = () => {
  setShowDeleteConfirm(false);
  setPromoToDelete(null);
};

const showSuccess = (message, type = 'success') => {
  setSuccessMessage(message);
  setAlertType(type);
  setShowSuccessAlert(true);
  setTimeout(() => setShowSuccessAlert(false), 3000);
};

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
       {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-2 sm:gap-3">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
                  Codes Promo
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Créez et gérez vos codes promotionnels
                </p>
              </div>
              <button
                onClick={() => openModal()}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 text-white rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-sm sm:text-base text-center flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Nouveau Code
              </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Total</p>
                    <p className="text-2xl sm:text-3xl font-bold text-pink-600">{stats.total}</p>
                  </div>
                  <Tag className="w-8 h-8 sm:w-12 sm:h-12 text-pink-500 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Actifs</p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.actifs}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Utilisations</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.utilises}</p>
                  </div>
                  <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              <span className="text-sm sm:text-base font-bold text-gray-800">Rechercher</span>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un code promo..."
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
          </div>
       

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-pink-300 to-pink-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Réduction</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Validité</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Utilisations</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                        <span>Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPromos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun code promo trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredPromos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-pink-500" />
                          <span className="font-bold text-gray-800">{promo.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-pink-600 font-bold">
                          {promo.pourcentage_reduction 
                            ? `${promo.pourcentage_reduction}%`
                            : `${promo.montant_reduction} DA`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(promo.date_debut).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(promo.date_fin).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-bold text-gray-800">{promo.utilisations_actuelles || 0}</span>
                          {promo.utilisations_max && (
                            <span className="text-gray-500"> / {promo.utilisations_max}</span>
                          )}
                          {!promo.utilisations_max && (
                            <span className="text-gray-500"> / ∞</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(promo.status)}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(promo.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title={promo.actif ? 'Désactiver' : 'Activer'}
                          >
                            {promo.actif ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => openModal(promo)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5 text-blue-500" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(promo)}
                            className="p-2 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                <span className="text-gray-500 text-sm">Chargement...</span>
              </div>
            </div>
          ) : filteredPromos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucun code promo</p>
            </div>
          ) : (
            filteredPromos.map((promo) => (
              <div key={promo.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span className="font-bold text-gray-800 text-base">{promo.code}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusBadge(promo.status)}`}>
                    {promo.status}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-xl font-bold text-pink-600">
                    {promo.pourcentage_reduction 
                      ? `${promo.pourcentage_reduction}%`
                      : `${promo.montant_reduction} DA`
                    }
                  </span>
                  <span className="text-gray-500 text-xs ml-2">réduction</span>
                </div>

                <div className="space-y-1.5 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Du {new Date(promo.date_debut).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Au {new Date(promo.date_fin).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 text-xs">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">
                    <span className="font-bold text-gray-800">{promo.utilisations_actuelles || 0}</span>
                    {promo.utilisations_max 
                      ? ` / ${promo.utilisations_max}`
                      : ' / ∞'
                    }
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(promo.id)}
                    className="flex-1 py-2 px-3 bg-gray-100 active:bg-gray-200 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {promo.actif ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-gray-700">Actif</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">Inactif</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openModal(promo)}
                    className="p-2 bg-blue-50 active:bg-blue-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(promo)}
                    className="p-2 bg-red-50 active:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                      {editingPromo ? 'Modifier' : 'Nouveau code'}
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Code Promo *</label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border-2 ${errors.code ? 'border-red-300' : 'border-gray-200'} rounded-lg md:rounded-xl focus:border-pink-400 focus:outline-none uppercase text-sm md:text-base`}
                          placeholder="PROMO2025"
                          maxLength="50"
                        />
                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Type de réduction *</label>
                        <div className="flex gap-3 md:gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="type"
                              value="pourcentage"
                              checked={formData.type === 'pourcentage'}
                              onChange={(e) => setFormData({...formData, type: e.target.value})}
                              className="w-4 h-4 text-pink-500"
                            />
                            <span className="text-gray-700 text-xs md:text-sm">Pourcentage (%)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="type"
                              value="montant"
                              checked={formData.type === 'montant'}
                              onChange={(e) => setFormData({...formData, type: e.target.value})}
                              className="w-4 h-4 text-pink-500"
                            />
                            <span className="text-gray-700 text-xs md:text-sm">Montant fixe (DA)</span>
                          </label>
                        </div>
                      </div>

                      {formData.type === 'pourcentage' ? (
                        <div>
                          <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Pourcentage *</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="0.01"
                            value={formData.pourcentage_reduction}
                            onChange={(e) => setFormData({...formData, pourcentage_reduction: e.target.value})}
                            className={`w-full px-3 md:px-4 py-2.5 md:py-3 border-2 ${errors.pourcentage_reduction ? 'border-red-300' : 'border-gray-200'} rounded-lg md:rounded-xl focus:border-pink-400 focus:outline-none text-sm md:text-base`}
                            placeholder="10"
                          />
                          {errors.pourcentage_reduction && <p className="text-red-500 text-xs mt-1">{errors.pourcentage_reduction}</p>}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Montant (DA) *</label>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={formData.montant_reduction}
                            onChange={(e) => setFormData({...formData, montant_reduction: e.target.value})}
                            className={`w-full px-3 md:px-4 py-2.5 md:py-3 border-2 ${errors.montant_reduction ? 'border-red-300' : 'border-gray-200'} rounded-lg md:rounded-xl focus:border-pink-400 focus:outline-none text-sm md:text-base`}
                            placeholder="500"
                          />
                          {errors.montant_reduction && <p className="text-red-500 text-xs mt-1">{errors.montant_reduction}</p>}
                        </div>
                      )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
  <div>
    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Date début *</label>
    <input
      type="date"
      value={formData.date_debut}
      onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
      className={`w-full px-3 md:px-4 py-2.5 md:py-3 border-2 ${errors.date_debut ? 'border-red-300' : 'border-gray-200'} rounded-lg md:rounded-xl focus:border-pink-400 focus:outline-none text-sm md:text-base`}
    />
    {errors.date_debut && <p className="text-red-500 text-xs mt-1">{errors.date_debut}</p>}
  </div>

  <div>
    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Date fin *</label>
    <input
      type="date"
      value={formData.date_fin}
      onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
      className={`w-full px-3 md:px-4 py-2.5 md:py-3 border-2 ${errors.date_fin ? 'border-red-300' : 'border-gray-200'} rounded-lg md:rounded-xl focus:border-pink-400 focus:outline-none text-sm md:text-base`}
    />
    {errors.date_fin && <p className="text-red-500 text-xs mt-1">{errors.date_fin}</p>}
  </div>
</div>

                      <div>
                        <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2">Utilisations max</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.utilisations_max}
                          onChange={(e) => setFormData({...formData, utilisations_max: e.target.value})}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-pink-400 focus:outline-none text-sm md:text-base"
                          placeholder="Illimité si vide"
                        />
                        <p className="text-xs text-gray-500 mt-1">Laissez vide pour illimité</p>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.actif === 1}
                            onChange={(e) => setFormData({...formData, actif: e.target.checked ? 1 : 0})}
                            className="w-4 h-4 md:w-5 md:h-5 text-pink-500 rounded"
                          />
                          <span className="text-gray-700 font-medium text-sm md:text-base">Code promo actif</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg md:rounded-xl font-bold hover:bg-gray-50 active:bg-gray-100 transition text-sm md:text-base"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300  text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg active:scale-95 transition text-sm md:text-base"
                      >
                        {editingPromo ? 'Mettre à jour' : 'Créer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
        {/* Modal de confirmation de suppression */}
{showDeleteConfirm && (
  <>
    <div className="fixed inset-0 bg-black/50 z-40" onClick={closeDeleteConfirm} />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600">Cette action est irréversible</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            Voulez-vous vraiment supprimer le code promo{' '}
            <span className="font-bold text-pink-600">{promoToDelete?.code}</span> ?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={closeDeleteConfirm}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </>
)}


{/* Alert de succès */}
{showSuccessAlert && (
  <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 animate-slide-in">
    <div className={`bg-white rounded-xl shadow-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-l-4 ${
      alertType === 'green' ? 'border-green-500' :
      alertType === 'blue' ? 'border-blue-500' :
      alertType === 'red' ? 'border-red-500' : 'border-green-500'
    }`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        alertType === 'green' ? 'bg-green-100' :
        alertType === 'blue' ? 'bg-blue-100' :
        alertType === 'red' ? 'bg-red-100' : 'bg-green-100'
      }`}>
        <Check className={`w-4 h-4 sm:w-5 sm:h-5 ${
          alertType === 'green' ? 'text-green-600' :
          alertType === 'blue' ? 'text-blue-600' :
          alertType === 'red' ? 'text-red-600' : 'text-green-600'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm sm:text-base">
          {alertType === 'green' ? 'Créé' : 
           alertType === 'blue' ? 'Mis à jour' : 
           alertType === 'red' ? 'Supprimé' : 'Succès'}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 truncate">{successMessage}</p>
      </div>
      <button
        onClick={() => setShowSuccessAlert(false)}
        className="p-1 hover:bg-gray-100 rounded-full transition flex-shrink-0"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  </div>
)}
      </div>
    </div>
    </Layout>
  );
}
