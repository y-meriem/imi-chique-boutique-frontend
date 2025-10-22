import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Heart, Sparkles, Lock, Mail, ArrowLeft, AlertCircle, CheckCircle, Star, User, Phone, Edit3 } from 'lucide-react';
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
      await userService.updateUser(profile.id, formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès ! 🎉');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/3 w-36 h-36 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* Floating Icons */}
          <div className="absolute top-1/4 left-1/4 animate-bounce" style={{animationDuration: '3s'}}>
            <Star className="w-6 h-6 text-pink-300 opacity-40" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
            <Heart className="w-5 h-5 text-purple-300 opacity-40" />
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}>
            <Sparkles className="w-6 h-6 text-blue-300 opacity-40" />
          </div>
        </div>

        <div className="max-w-2xl w-full relative z-10">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-pink-100 relative overflow-hidden">
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-200 to-pink-200 rounded-tr-full opacity-50"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
                  <User className="w-7 h-7 md:w-8 md:h-8 text-pink-500" />
                  Mon Profil
                </h2>
                <p className="text-base md:text-lg text-gray-500">Gère tes informations personnelles 💕</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}

              {profile && (
                <>
                  {!isEditing ? (
                    // View Mode
                    <div className="space-y-4">
                      {/* Row 1: Nom & Prénom */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Profile Item - Nom */}
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-2xl border-2 border-pink-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-pink-500" />
                            <label className="text-xs font-bold text-gray-600">Nom</label>
                          </div>
                          <p className="text-lg font-semibold text-gray-800">{profile.nom}</p>
                        </div>

                        {/* Profile Item - Prénom */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-2xl border-2 border-purple-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-purple-500" />
                            <label className="text-xs font-bold text-gray-600">Prénom</label>
                          </div>
                          <p className="text-lg font-semibold text-gray-800">{profile.prenom}</p>
                        </div>
                      </div>

                      {/* Row 2: Email & Téléphone */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Profile Item - Email */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <label className="text-xs font-bold text-gray-600">Email</label>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 break-all">{profile.email}</p>
                        </div>

                        {/* Profile Item - Téléphone */}
                        <div className="bg-gradient-to-r from-indigo-50 to-pink-50 p-5 rounded-2xl border-2 border-indigo-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4 text-indigo-500" />
                            <label className="text-xs font-bold text-gray-600">Téléphone</label>
                          </div>
                          <p className="text-lg font-semibold text-gray-800">{profile.telephone}</p>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 mt-8 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-2">
                          <Edit3 className="w-5 h-5" />
                          Modifier mes informations
                          <Sparkles className="w-5 h-5" />
                        </span>
                      </button>
                    </div>
                  ) : (
                    // Edit Mode
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
                      {/* Row 1: Nom & Prénom */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Nom Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <User className="w-4 h-4 text-pink-500" />
                            Nom
                          </label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                            <input
                              type="text"
                              name="nom"
                              value={formData.nom}
                              onChange={handleChange}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md"
                            />
                          </div>
                        </div>

                        {/* Prénom Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <User className="w-4 h-4 text-purple-500" />
                            Prénom
                          </label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                              type="text"
                              name="prenom"
                              value={formData.prenom}
                              onChange={handleChange}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Email & Téléphone */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Email Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <Mail className="w-4 h-4 text-blue-500" />
                            Email
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md"
                            />
                          </div>
                        </div>

                        {/* Téléphone Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <Phone className="w-4 h-4 text-indigo-500" />
                            Téléphone
                          </label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                              type="tel"
                              name="telephone"
                              value={formData.telephone}
                              onChange={handleChange}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="relative flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Enregistrer
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="relative flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Annuler
                          </span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-gray-800 font-medium bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyProfile;