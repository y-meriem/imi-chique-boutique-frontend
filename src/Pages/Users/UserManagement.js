import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Save, X, Search, Mail, 
  Phone, UserCheck, AlertTriangle, Shield, User,Check,
} from 'lucide-react';
import { userService } from '../../services/userService';
import Layout from '../../components/layout/Layout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    type: 'user'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      alert('❌ Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFilter = filterType === 'all' ? true : user.type === filterType;
    return matchSearch && matchFilter;
  });

  // Statistiques
  const stats = {
    total: users.length,
    admins: users.filter(u => u.type === 'admin').length,
    utilisateurs: users.filter(u => u.type === 'user').length
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    
    if (!editingUser) {
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setShowAddModal(true);
    setEditingUser(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      type: 'user'
    });
    setErrors({});
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      type: user.type,
      password: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);

  try {
    if (editingUser) {
      await userService.updateUser(editingUser.id, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        type: formData.type
      });
      showSuccess('Utilisateur mis à jour avec succès', 'update'); // ✅ Point-virgule ajouté
    } else {
      await userService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        password: formData.password,
        type: formData.type
      });
      showSuccess('Utilisateur créé avec succès', 'create'); // ✅ Changé de alert() à showSuccess()
    }

    setShowAddModal(false);
    loadUsers();
  } catch (err) {
    alert('❌ ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {  // ✅ Plus de paramètres
  try {
    setLoading(true);
    await userService.deleteUser(userToDelete.id);  // ✅ Utiliser userToDelete
    showSuccess('Utilisateur supprimé avec succès', 'delete');
    loadUsers();  // ✅ Recharger les données
    closeDeleteConfirm();  // ✅ Fermer la modal
  } catch (err) {
    alert('❌ ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  // Après la fonction handleChange, ajoutez :
const openDeleteConfirm = (user) => {
  setUserToDelete(user);
  setShowDeleteConfirm(true);
};

const closeDeleteConfirm = () => {
  setShowDeleteConfirm(false);
  setUserToDelete(null);
};

const showSuccess = (message, type = 'success') => {
  setSuccessMessage(message);
  setAlertType(type);
  setShowSuccessAlert(true);
  setTimeout(() => setShowSuccessAlert(false), 3000);
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
                <Users className="w-8 h-8 text-pink-500" />
                Utilisateurs
              </h1>
              <p className="text-gray-600 font-medium">
                Gérez les utilisateurs et administrateurs du système
              </p>
            </div>
           
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 shadow-lg shadow-pink-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <Users className="w-12 h-12 text-pink-500 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg shadow-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Administrateurs</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
                </div>
                <Shield className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg shadow-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Utilisateurs Normaux</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.utilisateurs}</p>
                </div>
                <User className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>
{/* Alert de succès - Ajoutez juste après la fermeture de la div "bg-white rounded-2xl shadow-lg p-6 mb-6" */}
{showSuccessAlert && (
  <div className="mb-4 sm:mb-6 animate-slide-down">
    <div className={`border-2 rounded-2xl p-4 shadow-lg ${
      alertType === 'create' 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : alertType === 'update'
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        : alertType === 'delete'
        ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
        : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          alertType === 'create'
            ? 'bg-green-100'
            : alertType === 'update'
            ? 'bg-blue-100'
            : alertType === 'delete'
            ? 'bg-pink-100'
            : 'bg-green-100'
        }`}>
          {alertType === 'create' && <Plus className="w-6 h-6 text-green-600" />}
          {alertType === 'update' && <Check className="w-6 h-6 text-blue-600" />}
          {alertType === 'delete' && <Trash2 className="w-6 h-6 text-pink-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm sm:text-base ${
            alertType === 'create'
              ? 'text-green-800'
              : alertType === 'update'
              ? 'text-blue-800'
              : alertType === 'delete'
              ? 'text-pink-800'
              : 'text-green-800'
          }`}>
            {alertType === 'create' && '✨ Créé !'}
            {alertType === 'update' && '✅ Mis à jour !'}
            {alertType === 'delete' && '🗑️ Supprimé !'}
          </p>
          <p className={`text-xs sm:text-sm ${
            alertType === 'create'
              ? 'text-green-700'
              : alertType === 'update'
              ? 'text-blue-700'
              : alertType === 'delete'
              ? 'text-pink-700'
              : 'text-green-700'
          }`}>
            {successMessage}
          </p>
        </div>
        <button
          onClick={() => setShowSuccessAlert(false)}
          className={`flex-shrink-0 transition p-1 ${
            alertType === 'create'
              ? 'text-green-400 hover:text-green-600'
              : alertType === 'update'
              ? 'text-blue-400 hover:text-blue-600'
              : alertType === 'delete'
              ? 'text-pink-400 hover:text-pink-600'
              : 'text-green-400 hover:text-green-600'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
)}
        {/* Tableau */}
      {/* Tableau */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
  {loading ? (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  ) : filteredUsers.length === 0 ? (
    <div className="text-center py-20">
      <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Aucun utilisateur trouvé</p>
    </div>
  ) : (
    <>
      {/* Version Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-pink-400 via-[#f77fbe] to-pink-300 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Nom</th>
              <th className="px-6 py-4 text-left font-bold">Prénom</th>
              <th className="px-6 py-4 text-left font-bold">Email</th>
              <th className="px-6 py-4 text-center font-bold">Téléphone</th>
              <th className="px-6 py-4 text-center font-bold">Type</th>
              <th className="px-6 py-4 text-center font-bold">Date création</th>
              <th className="px-6 py-4 text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr 
                key={user.id}
                className={`hover:bg-pink-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-6 py-4 font-bold text-gray-800">{user.nom}</td>
                <td className="px-6 py-4 text-gray-700">{user.prenom}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-pink-500" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-pink-500" />
                    {user.telephone}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold ${
                    user.type === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.type === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Utilisateur
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm({
                        id: user.id,
                        nom: `${user.prenom} ${user.nom}`
                      })}
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

      {/* Version Mobile */}
      <div className="md:hidden space-y-4 p-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{user.prenom} {user.nom}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                  user.type === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.type === 'admin' ? (
                    <>
                      <Shield className="w-3 h-3" />
                      Admin
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3" />
                      Utilisateur
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteConfirm({
                    id: user.id,
                    nom: `${user.prenom} ${user.nom}`
                  })}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span>{user.telephone}</span>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</div>

        {/* Résumé */}
        <div className="mt-4 text-center text-gray-600">
          Affichage de {filteredUsers.length} sur {users.length} utilisateurs
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {editingUser ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.nom ? 'border-red-300' : 'border-gray-200'
                      } focus:border-pink-400 focus:outline-none`}
                      placeholder="Dupont"
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.prenom ? 'border-red-300' : 'border-gray-200'
                      } focus:border-pink-400 focus:outline-none`}
                      placeholder="Jean"
                    />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    } focus:border-pink-400 focus:outline-none`}
                    placeholder="jean@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.telephone ? 'border-red-300' : 'border-gray-200'
                    } focus:border-pink-400 focus:outline-none`}
                    placeholder="+213 555 123 456"
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      } focus:border-pink-400 focus:outline-none`}
                      placeholder="Minimum 6 caractères"
                      minLength="6"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Type d'utilisateur *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none"
                  >
                    <option value="user">Utilisateur normal</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                      {editingUser ? 'Mettre à jour' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    {/* Modal de confirmation de suppression - Ajoutez avant </Layout> */}
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Confirmer la suppression
        </h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer <span className="font-bold text-gray-900">{userToDelete?.nom}</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={closeDeleteConfirm}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              'Supprimer'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default UserManagement;
