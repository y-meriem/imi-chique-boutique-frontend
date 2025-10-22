import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Star, AlertCircle, CheckCircle, Trash2, ArrowLeft } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyAvis = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    fetchMyAvis();
  }, []);

  const fetchMyAvis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/avis/my-avis`,
        getAuthHeaders()
      );
      setAvis(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (avisId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      setError('');
      await axios.delete(
        `${API_URL}/avis/${avisId}`,
        getAuthHeaders()
      );
      setAvis(avis.filter(a => a.id !== avisId));
      setSuccess('Avis supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const renderStars = (note) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getStatutBadge = (statut) => {
    const styles = {
      approuve: 'bg-green-100 text-green-700 border-green-300',
      en_attente: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      rejete: 'bg-red-100 text-red-700 border-red-300'
    };
    
    const labels = {
      approuve: 'Approuvé',
      en_attente: 'En attente',
      rejete: 'Rejeté'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${styles[statut] || styles.en_attente}`}>
        {labels[statut] || statut}
      </span>
    );
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/3 w-36 h-36 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-3">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              Mes Avis
              <Sparkles className="w-8 h-8 text-pink-500" />
            </h1>
            <p className="text-lg text-gray-600">Gère tous tes avis et recommandations 💭</p>
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

          {/* Avis List */}
          {avis.length > 0 ? (
            <div className="space-y-5">
              {avis.map(a => (
                <div key={a.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-pink-100 p-6 hover:shadow-xl transition-all">
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {a.produit_titre ? `📦 ${a.produit_titre}` : '💬 Avis Général'}
                      </h3>
                      <div className="flex items-center gap-4">
                        {renderStars(a.note)}
                        <span className="text-sm text-gray-600">{a.note}/5</span>
                        {getStatutBadge(a.statut)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                      title="Supprimer cet avis"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-4 border border-pink-200">
                    <p className="text-gray-700 text-base leading-relaxed">{a.commentaire}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <p><strong>Par:</strong> {a.nom}</p>
                      <p><strong>Email:</strong> {a.email}</p>
                    </div>
                    <p className="text-right">
                      {new Date(a.date_creation).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-pink-100 p-12 inline-block">
                <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun avis pour le moment</h3>
                <p className="text-gray-600">Partage ton expérience en laissant un avis sur nos produits ! ✨</p>
              </div>
            </div>
          )}

          {/* Back to Profile */}
          <div className="text-center mt-12">
            <Link 
              to="/profile" 
              className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-gray-800 font-medium bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au profil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAvis;