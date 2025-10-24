import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { X, Save,Heart, Sparkles, Lock, Mail, ArrowLeft, AlertCircle, CheckCircle, Star, User, Phone, Edit3 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Link } from 'react-router-dom';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleUpdate = async () => {
  try {
    setError('');
    setSuccess('');
    
    // ✅ CORRECTION : Appeler updateProfile au lieu de updateUser
    const response = await userService.updateProfile(formData);
    
    setProfile({ ...profile, ...formData });
    setIsEditing(false);
    setSuccess(response.message || 'Profil mis à jour avec succès ! 🎉');
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    // ✅ Le message d'erreur détaillé du backend s'affichera maintenant
    setError(err.message);
  }
};
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

 return (
  <Layout>
    <div className="min-h-screen  p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <User className="w-8 h-8 text-pink-500" />
                Mon Profil
              </h1>
              <p className="text-gray-600 font-medium">
                Gérez vos informations personnelles
              </p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white rounded-xl font-bold hover:shadow-xl transition flex items-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Alert de succès */}
        {success && (
          <div className="mb-6 animate-slide-down">
            <div className="border-2 rounded-2xl p-4 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base text-green-800">
                    ✅ Succès !
                  </p>
                  <p className="text-xs sm:text-sm text-green-700">
                    {success}
                  </p>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="flex-shrink-0 transition p-1 text-green-400 hover:text-green-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert d'erreur */}
        {error && (
          <div className="mb-6 animate-slide-down">
            <div className="border-2 rounded-2xl p-4 shadow-lg bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base text-red-800">
                    ❌ Erreur !
                  </p>
                  <p className="text-xs sm:text-sm text-red-700">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="flex-shrink-0 transition p-1 text-red-400 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu Principal */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {!isEditing ? (
              // Mode Affichage
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 hover:shadow-md transition">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-pink-400" />
                      </div>
                      <label className="text-sm font-bold text-gray-600">Nom</label>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{profile.nom}</p>
                  </div>

                  {/* Prénom */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 hover:shadow-md transition">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-pink-300 flex items-center justify-center">
                        <User className="w-5 h-5 text-pink-500" />
                      </div>
                      <label className="text-sm font-bold text-gray-600">Prénom</label>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{profile.prenom}</p>
                  </div>

                  {/* Email */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 hover:shadow-md transition">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-pink-400" />
                      </div>
                      <label className="text-sm font-bold text-gray-600">Email</label>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800 break-all">
                      {profile.email}
                    </p>
                  </div>

                  {/* Téléphone */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 hover:shadow-md transition">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-pink-300 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-pink-700" />
                      </div>
                      <label className="text-sm font-bold text-gray-600">Téléphone</label>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{profile.telephone}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Mode Édition
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Nom Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-pink-500" />
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none"
                      placeholder="Votre nom"
                    />
                  </div>

                  {/* Prénom Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-pink-500" />
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none"
                      placeholder="Votre prénom"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-pink-500" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none"
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* Téléphone Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-pink-500" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none"
                      placeholder="+213 555 123 456"
                    />
                  </div>
                </div>

                {/* Boutons Action */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleUpdate(); }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </Layout>
);
};

export default MyProfile;
