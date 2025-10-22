// src/pages/admin/AdminDelivery.js
import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Edit2, Trash2, Save, X, Search, MapPin, 
  CheckCircle, XCircle, Package, Home, Building2, Clock,
  AlertTriangle, Filter,
} from 'lucide-react';
import { livraisonService } from '../../services/livraisonService';
import Layout from '../../components/layout/Layout';


const AdminDelivery = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActif, setFilterActif] = useState('all'); // all, active, inactive
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLivraison, setCurrentLivraison] = useState(null);
  const [formData, setFormData] = useState({
    wilaya: '',
    prix_bureau: '',
    prix_domicile: '',
    delai_livraison: '2-5 jours',
    actif: true
  });
  const [errors, setErrors] = useState({});

  // Charger les livraisons
  useEffect(() => {
    loadLivraisons();
  }, []);

  const loadLivraisons = async () => {
    try {
      setLoading(true);
      const data = await livraisonService.getAllDeliveryRates();
      setLivraisons(data);
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('❌ Erreur lors du chargement des livraisons');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les livraisons
  const filteredLivraisons = livraisons.filter(liv => {
    const matchSearch = liv.wilaya.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterActif === 'all' 
      ? true 
      : filterActif === 'active' 
        ? liv.actif 
        : !liv.actif;
    return matchSearch && matchFilter;
  });

  // Statistiques
  const stats = {
    total: livraisons.length,
    actives: livraisons.filter(l => l.actif).length,
    inactives: livraisons.filter(l => !l.actif).length,
    gratuites: livraisons.filter(l => l.prix_bureau === 0).length
  };

  // Ouvrir modal pour créer
  const handleCreate = () => {
    setEditMode(false);
    setCurrentLivraison(null);
    setFormData({
      wilaya: '',
      prix_bureau: '',
      prix_domicile: '',
      delai_livraison: '2-5 jours',
      actif: true
    });
    setErrors({});
    setShowModal(true);
  };

  // Ouvrir modal pour modifier
  const handleEdit = (livraison) => {
    setEditMode(true);
    setCurrentLivraison(livraison);
    setFormData({
      wilaya: livraison.wilaya,
      prix_bureau: livraison.prix_bureau,
      prix_domicile: livraison.prix_domicile,
      delai_livraison: livraison.delai_livraison,
      actif: livraison.actif
    });
    setErrors({});
    setShowModal(true);
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.wilaya.trim()) {
      newErrors.wilaya = 'La wilaya est requise';
    }
    if (formData.prix_bureau === '' || formData.prix_bureau < 0) {
      newErrors.prix_bureau = 'Prix bureau invalide';
    }
    if (formData.prix_domicile === '' || formData.prix_domicile < 0) {
      newErrors.prix_domicile = 'Prix domicile invalide';
    }
    if (!formData.delai_livraison.trim()) {
      newErrors.delai_livraison = 'Le délai est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editMode) {
        await livraisonService.updateDeliveryRate(currentLivraison.id, formData);
        alert('✅ Tarif mis à jour avec succès');
      } else {
        await livraisonService.createDeliveryRate(formData);
        alert('✅ Tarif créé avec succès');
      }

      setShowModal(false);
      loadLivraisons();
    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer
  const handleDelete = async (id, wilaya) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer les tarifs pour ${wilaya} ?`)) {
      return;
    }

    try {
      setLoading(true);
      await livraisonService.deleteDeliveryRate(id);
      alert('✅ Tarif supprimé avec succès');
      loadLivraisons();
    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle actif/inactif
  const toggleActif = async (livraison) => {
    try {
      setLoading(true);
      await livraisonService.updateDeliveryRate(livraison.id, {
        ...livraison,
        actif: !livraison.actif
      });
      loadLivraisons();
    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
         <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <Truck className="w-8 h-8 text-pink-500" />
                Livraisons
              </h1>
              <p className="text-gray-600 font-medium">
                Gérez les tarifs de livraison par wilaya
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 text-white rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Wilaya
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une wilaya..."
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

            <select
              value={filterActif}
              onChange={(e) => setFilterActif(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
            >
              <option value="all">Toutes les wilayas</option>
              <option value="active">Actives uniquement</option>
              <option value="inactive">Inactives uniquement</option>
            </select>
          </div>

          {/* Statistiques */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">Total Wilayas</p>
        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
      </div>
      <MapPin className="w-12 h-12 text-pink-500 opacity-20" />
    </div>
  </div>

  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50 transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">Actives</p>
        <p className="text-3xl font-bold text-green-600">{stats.actives}</p>
      </div>
      <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
    </div>
  </div>

  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50 transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">Inactives</p>
        <p className="text-3xl font-bold text-red-600">{stats.inactives}</p>
      </div>
      <XCircle className="w-12 h-12 text-red-500 opacity-20" />
    </div>
  </div>

  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">Bureau Gratuit</p>
        <p className="text-3xl font-bold text-purple-600">{stats.gratuites}</p>
      </div>
      <Package className="w-12 h-12 text-purple-500 opacity-20" />
    </div>
  </div>
</div>
        </div>

      

        {/* Tableau des livraisons */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : filteredLivraisons.length === 0 ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucune wilaya trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-400 via-[#f77fbe] to-pink-300 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Wilaya</th>
                    <th className="px-6 py-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Bureau
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Home className="w-4 h-4" />
                        Domicile
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Délai
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-bold">Statut</th>
                    <th className="px-6 py-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLivraisons.map((livraison, index) => (
                    <tr 
                      key={livraison.id}
                      className={`hover:bg-pink-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-pink-600" />
                          <span className="font-bold text-gray-800">{livraison.wilaya}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                          livraison.prix_bureau === 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {livraison.prix_bureau === 0 ? 'Gratuit' : `${livraison.prix_bureau} DA`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full font-bold bg-pink-100 text-pink-700">
                          {livraison.prix_domicile} DA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {livraison.delai_livraison}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActif(livraison)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold transition ${
                            livraison.actif 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {livraison.actif ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(livraison)}
                            className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(livraison.id, livraison.wilaya)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Résumé en bas */}
        <div className="mt-4 text-center text-gray-600">
          Affichage de {filteredLivraisons.length} sur {livraisons.length} wilayas
        </div>

      </div>

      {/* Modal Créer/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {editMode ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  {editMode ? 'Modifier la livraison' : 'Ajouter une livraison'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Wilaya */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Wilaya *
                  </label>
                  <input
                    type="text"
                    value={formData.wilaya}
                    onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
                    disabled={editMode}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.wilaya ? 'border-red-300' : 'border-gray-200'
                    } focus:border-pink-400 focus:outline-none ${editMode ? 'bg-gray-100' : ''}`}
                    placeholder="Ex: Alger"
                  />
                  {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Prix Bureau */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Prix Bureau (DA) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prix_bureau}
                      onChange={(e) => setFormData({...formData, prix_bureau: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.prix_bureau ? 'border-red-300' : 'border-gray-200'
                      } focus:border-pink-400 focus:outline-none`}
                      placeholder="0"
                    />
                    {errors.prix_bureau && <p className="text-red-500 text-xs mt-1">{errors.prix_bureau}</p>}
                    <p className="text-xs text-gray-500 mt-1">Mettre 0 pour gratuit</p>
                  </div>

                  {/* Prix Domicile */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <Home className="w-4 h-4 inline mr-1" />
                      Prix Domicile (DA) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prix_domicile}
                      onChange={(e) => setFormData({...formData, prix_domicile: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.prix_domicile ? 'border-red-300' : 'border-gray-200'
                      } focus:border-pink-400 focus:outline-none`}
                      placeholder="0"
                    />
                    {errors.prix_domicile && <p className="text-red-500 text-xs mt-1">{errors.prix_domicile}</p>}
                  </div>
                </div>

                {/* Délai */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Délai de livraison *
                  </label>
                  <input
                    type="text"
                    value={formData.delai_livraison}
                    onChange={(e) => setFormData({...formData, delai_livraison: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.delai_livraison ? 'border-red-300' : 'border-gray-200'
                    } focus:border-pink-400 focus:outline-none`}
                    placeholder="Ex: 2-5 jours"
                  />
                  {errors.delai_livraison && <p className="text-red-500 text-xs mt-1">{errors.delai_livraison}</p>}
                </div>

                {/* Actif */}
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                  />
                  <label htmlFor="actif" className="font-bold text-gray-700 cursor-pointer">
                    Wilaya active
                  </label>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editMode ? 'Mettre à jour' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default AdminDelivery;