import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Package, Clock, Truck, CheckCircle, XCircle, Eye, ArrowLeft, ShoppingBag, AlertCircle, MapPin, Phone, User, ChevronDown, ChevronUp } from 'lucide-react';

const MesCommandes = () => {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${user.id}/orders`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error('Erreur lors de la récupération des commandes');
      }
      
      const data = await response.json();

      if (data.success) {
        setCommandes(data.data || []);
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (statut) => {
    const statusMap = {
      en_attente: {
        label: 'En attente',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-300',
        icon: Clock,
        gradient: 'from-yellow-50 to-yellow-100'
      },
      confirmee: {
        label: 'Confirmée',
        color: 'bg-blue-50 text-blue-700 border-blue-300',
        icon: CheckCircle,
        gradient: 'from-blue-50 to-blue-100'
      },
      en_cours: {
        label: 'En cours',
        color: 'bg-purple-50 text-purple-700 border-purple-300',
        icon: Truck,
        gradient: 'from-purple-50 to-purple-100'
      },
      livree: {
        label: 'Livrée',
        color: 'bg-green-50 text-green-700 border-green-300',
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100'
      },
      annulee: {
        label: 'Annulée',
        color: 'bg-red-50 text-red-700 border-red-300',
        icon: XCircle,
        gradient: 'from-red-50 to-red-100'
      }
    };

    return statusMap[statut] || statusMap.en_attente;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-DZ').format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Chargement de vos commandes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={loadCommandes}
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition w-full sm:w-auto"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {/* Bouton retour */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 mb-4 sm:mb-6 transition-all hover:gap-3 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Retour</span>
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-pink-500 flex-shrink-0" />
                <span className="whitespace-nowrap">Mes Commandes</span>
              </h1>
              <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <span className="text-xs sm:text-sm">Total: </span>
                <span className="font-bold text-sm sm:text-lg">{commandes.length}</span>
              </div>
            </div>
          </div>

          {/* Liste des commandes */}
          {commandes.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-12 text-center">
              <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Aucune commande</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">Vous n'avez pas encore passé de commande</p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                Découvrir nos produits
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {commandes.map((commande) => {
                const statusInfo = getStatusInfo(commande.statut);
                const StatusIcon = statusInfo.icon;
                const isExpanded = selectedOrder?.id === commande.id;

                return (
                  <div
                    key={commande.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* En-tête de la commande - Optimisé mobile */}
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="bg-gradient-to-br from-pink-500 to-pink-400 text-white w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-xl shadow-lg flex-shrink-0">
                            #{commande.id}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Commande passée le</p>
                            <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{formatDate(commande.date_commande)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-2 ${statusInfo.color} flex-1 sm:flex-initial justify-center`}>
                            <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{statusInfo.label}</span>
                          </span>
                          <button
                            onClick={() => setSelectedOrder(isExpanded ? null : commande)}
                            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all flex-shrink-0 ${
                              isExpanded 
                                ? 'bg-pink-500 text-white shadow-lg' 
                                : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                            }`}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Résumé de la commande - Grid optimisé mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6">
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-pink-200 shadow-lg shadow-pink-200/50">
                        <p className="text-xs font-semibold text-pink-600 mb-1">Montant total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-pink-700">{formatPrice(commande.total)} DA</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-purple-200 shadow-lg shadow-purple-200/50">
                        <p className="text-xs font-semibold text-purple-600 mb-1">Articles</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-700">{commande.articles?.length || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-blue-200 shadow-lg shadow-blue-200/50">
                        <p className="text-xs font-semibold text-blue-600 mb-1">Livraison</p>
                        <p className="text-base sm:text-lg font-bold text-blue-700">
                          {commande.type_livraison === 'domicile' ? '🏠 À domicile' : '🏢 Au bureau'}
                        </p>
                      </div>
                    </div>

                    {/* Détails de la commande (dépliable) */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="border-t-2 border-pink-100 pt-4 sm:pt-6">
                          <h3 className="font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                            Détails de la commande
                          </h3>

                          {/* Informations client et financières - Stack sur mobile */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200 shadow-lg">
                              <h4 className="font-bold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                                Informations de livraison
                              </h4>
                              <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                                <p className="flex items-start gap-2">
                                  <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <span><span className="font-semibold">Client:</span> {commande.nom_client} {commande.prenom_client}</span>
                                </p>
                                <p className="flex items-start gap-2">
                                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <span><span className="font-semibold">Téléphone:</span> {commande.telephone}</span>
                                </p>
                                <p className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <span><span className="font-semibold">Wilaya:</span> {commande.wilaya}</span>
                                </p>
                                <p className="ml-6 text-xs sm:text-sm"><span className="font-semibold">Commune:</span> {commande.commune}</p>
                                {commande.adresse && (
                                  <p className="ml-6 bg-white rounded-lg p-2 mt-2 text-xs sm:text-sm">
                                    <span className="font-semibold">Adresse:</span> {commande.adresse}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200 shadow-lg">
                              <h4 className="font-bold text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">💰 Résumé financier</h4>
                              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                  <span className="text-gray-600">Sous-total:</span>
                                  <span className="font-semibold">{formatPrice(commande.total - commande.frais_livraison + (commande.montant_reduction || 0))} DA</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                  <span className="text-gray-600">Frais de livraison:</span>
                                  <span className="font-semibold text-blue-600">+{formatPrice(commande.frais_livraison)} DA</span>
                                </div>
                                {commande.montant_reduction > 0 && (
                                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-200">
                                    <span className="text-green-700 font-semibold">🎉 Réduction:</span>
                                    <span className="font-bold text-green-600">-{formatPrice(commande.montant_reduction)} DA</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t-2 border-gray-300">
                                  <span className="font-bold text-gray-800 text-sm sm:text-base">Total:</span>
                                  <span className="font-bold text-pink-600 text-lg sm:text-xl">{formatPrice(commande.total)} DA</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Articles commandés - Optimisé mobile */}
                          <h4 className="font-bold text-gray-700 mb-3 sm:mb-4 text-base sm:text-lg">📦 Articles commandés</h4>
                          <div className="space-y-3">
                            {commande.articles?.map((article, index) => (
                              <div key={index} className="flex gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-gray-200 hover:border-pink-300 transition-all shadow-lg">
                                {article.image && (
                                  <img
                                    src={article.image.startsWith('http') 
                                      ? article.image 
                                      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${article.image}`
                                    }
                                    alt={article.titre}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg sm:rounded-xl shadow-md flex-shrink-0"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                                    }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-gray-800 text-sm sm:text-lg mb-2 line-clamp-2">{article.titre}</h5>
                                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                                    {article.couleur && (
                                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-200">
                                        <div
                                          className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0"
                                          style={{ backgroundColor: article.code_couleur }}
                                        />
                                        <span className="truncate">{article.couleur}</span>
                                      </span>
                                    )}
                                    {article.taille && (
                                      <span className="bg-pink-100 px-2 py-1 rounded-full font-semibold text-pink-600 border border-pink-200">
                                        {article.taille}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs sm:text-sm bg-purple-100 px-2 sm:px-3 py-1 rounded-full font-semibold text-purple-600">
                                      Qté: {article.quantite}
                                    </span>
                                    <span className="font-bold text-pink-600 text-sm sm:text-lg whitespace-nowrap">
                                      {formatPrice(article.prix_unitaire)} DA
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MesCommandes;
