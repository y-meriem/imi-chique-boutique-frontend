// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ShoppingBag, MapPin, Phone, User, Home, Sparkles, ArrowLeft, CheckCircle, Tag, Truck, Building2 } from 'lucide-react';
import { orderService } from '../services/orderService';
import { livraisonService } from '../services/livraisonService';
import { userService } from '../services/userService'; 
const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [promoApplied, setPromoApplied] = useState(null);
  const [wilayas, setWilayas] = useState([]);
  const [deliveryRate, setDeliveryRate] = useState(null);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    wilaya: '',
    commune: '',
    type_livraison: 'domicile',
    adresse: ''
  });

  const [errors, setErrors] = useState({});

  // Charger les wilayas disponibles
  useEffect(() => {
    const loadWilayas = async () => {
      try {
        const rates = await livraisonService.getAllDeliveryRates();
        setWilayas(rates);
      } catch (error) {
        console.error('Erreur chargement wilayas:', error);
      }
    };
    loadWilayas();
  }, []);

  // Charger le panier
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPromo = localStorage.getItem('promoApplied');
    
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        navigate('/');
      }
      setCart(parsedCart);
    } else {
      navigate('/');
    }
    
    if (savedPromo && savedPromo !== 'null') {
      try {
        setPromoApplied(JSON.parse(savedPromo));
      } catch (e) {
        console.error('Erreur parsing promo:', e);
      }
    }
  }, [navigate]);

  // Charger les tarifs quand wilaya change
  useEffect(() => {
    const loadDeliveryRate = async () => {
      if (formData.wilaya) {
        try {
          const rate = await livraisonService.getDeliveryRateByWilaya(formData.wilaya);
          setDeliveryRate(rate);
        } catch (error) {
          console.error('Erreur chargement tarif:', error);
          setDeliveryRate(null);
        }
      } else {
        setDeliveryRate(null);
      }
    };
    loadDeliveryRate();
  }, [formData.wilaya]);

  // Charger les données de l'utilisateur connecté
useEffect(() => {
  const user = userService.getCurrentUser();
  if (user) {
    setFormData(prev => ({
      ...prev,
      nom: user.nom || '',
      prenom: user.prenom || '',
      telephone: user.telephone || ''
    }));
  }
}, []);

  // Calculer les totaux
  const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
  const discount = promoApplied 
    ? promoApplied.pourcentage_reduction 
      ? (subtotal * promoApplied.pourcentage_reduction) / 100
      : Math.min(promoApplied.montant_reduction || 0, subtotal)
    : 0;
  
  const deliveryFee = deliveryRate 
    ? (formData.type_livraison === 'bureau' 
        ? parseFloat(deliveryRate.prix_bureau) 
        : parseFloat(deliveryRate.prix_domicile))
    : 0;
  
  const totalPrice = subtotal - discount + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^(05|06|07)[0-9]{8}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro invalide (ex: 0555123456)';
    }
    if (!formData.wilaya) newErrors.wilaya = 'La wilaya est requise';
    if (!formData.commune.trim()) newErrors.commune = 'La commune est requise';
    
    // Adresse obligatoire uniquement pour livraison à domicile
    if (formData.type_livraison === 'domicile' && !formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise pour livraison à domicile';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const currentUser = userService.getCurrentUser();
      const orderData = {
        user_id: currentUser?.id || null,
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.replace(/\s/g, ''),
        wilaya: formData.wilaya,
        commune: formData.commune.trim(),
        type_livraison: formData.type_livraison,
        adresse: formData.type_livraison === 'domicile' ? formData.adresse.trim() : null,
        frais_livraison: deliveryFee,
        total: totalPrice,
        code_promo_id: promoApplied?.id || null,
        montant_reduction: discount || 0,
        articles: cart.map(item => ({
          id: item.id,
          quantite: item.quantity,
          prix: item.prix,
          couleur_id: item.couleur?.id || null,
          taille: item.taille || null
        }))
      };

      const result = await orderService.createOrder(orderData);
      
      setOrderId(result.orderId);
      setOrderSuccess(true);
      
      localStorage.removeItem('cart');
      localStorage.removeItem('promoApplied');
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (error) {
      alert('❌ Erreur lors de la commande: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <Layout>
        <div className="min-h-screen  flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Commande Confirmée !</h2>
            <p className="text-gray-600 mb-6">Merci pour votre confiance 💝</p>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">1</div>
                <span>Nous traitons votre commande</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">2</div>
                <span>Vous serez contacté sous 24h</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                <span>Livraison sous 2-5 jours</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen  py-8">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-pink-500" />
            Finaliser ma commande
          </h1>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-pink-500" />
                  Vos informations
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${errors.nom ? 'border-red-300' : 'border-pink-200'} focus:border-pink-400 focus:outline-none`}
                      placeholder="Votre nom"
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${errors.prenom ? 'border-red-300' : 'border-pink-200'} focus:border-pink-400 focus:outline-none`}
                      placeholder="Votre prénom"
                    />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.telephone ? 'border-red-300' : 'border-pink-200'} focus:border-pink-400 focus:outline-none`}
                    placeholder="0555123456"
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Wilaya *
                    </label>
                    <select
                      name="wilaya"
                      value={formData.wilaya}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${errors.wilaya ? 'border-red-300' : 'border-pink-200'} focus:border-pink-400 focus:outline-none`}
                    >
                      <option value="">Sélectionner...</option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.wilaya}>{w.wilaya}</option>
                      ))}
                    </select>
                    {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Commune *</label>
                    <input
                      type="text"
                      name="commune"
                      value={formData.commune}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${errors.commune ? 'border-red-300' : 'border-pink-200'} focus:border-pink-400 focus:outline-none`}
                      placeholder="Votre commune"
                    />
                    {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune}</p>}
                  </div>
                </div>

                {/* Type de livraison */}
                {deliveryRate && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      <Truck className="w-4 h-4 inline mr-1" />
                      Type de livraison *
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type_livraison: 'domicile' }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.type_livraison === 'domicile'
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-pink-500" />
                            <span className="font-bold">À domicile</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.type_livraison === 'domicile' ? 'border-pink-500' : 'border-gray-300'
                          }`}>
                            {formData.type_livraison === 'domicile' && (
                              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-left">Livraison à votre adresse</p>
                        <p className="text-pink-600 font-bold mt-2">{deliveryRate.prix_domicile} DA</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type_livraison: 'bureau' }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.type_livraison === 'bureau'
                            ? 'border-pink-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-500" />
                            <span className="font-bold">Au bureau</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.type_livraison === 'bureau' ? 'border-purple-500' : 'border-gray-300'
                          }`}>
                            {formData.type_livraison === 'bureau' && (
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-left">Retrait au bureau</p>
                        <p className="text-purple-600 font-bold mt-2">
                          {deliveryRate.prix_bureau === 0 ? 'Gratuit' : `${deliveryRate.prix_bureau} DA`}
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Adresse (obligatoire pour domicile, optionnel pour bureau) */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Home className="w-4 h-4 inline mr-1" />
                    Adresse {formData.type_livraison === 'domicile' && '*'}
                    {formData.type_livraison === 'bureau' && (
                      <span className="text-gray-500 font-normal text-xs ml-2">(Optionnel)</span>
                    )}
                  </label>
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.adresse ? 'border-red-300' : 'border-pink-200'} focus:border-pink-400 focus:outline-none resize-none`}
                    placeholder={formData.type_livraison === 'domicile' 
                      ? "Rue, quartier, point de repère..." 
                      : "Point de repère pour faciliter le contact (optionnel)"}
                  />
                  {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Confirmer la commande
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Résumé</h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="flex gap-3 pb-3 border-b border-pink-100">
                      <img src={item.image} alt={item.titre} className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.titre}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {item.couleur && (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.couleur.code }} />
                              {item.couleur.nom}
                            </span>
                          )}
                          {item.taille && <span className="bg-pink-100 px-2 py-0.5 rounded">{item.taille}</span>}
                        </div>
                        <p className="text-pink-600 font-bold text-sm mt-1">
                          {item.prix} DA × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-pink-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-bold text-gray-800">{subtotal.toFixed(2)} DA</span>
                  </div>
                  
                  {promoApplied && discount > 0 && (
                    <div className="flex justify-between items-center mb-2 bg-green-50 px-3 py-2 rounded-lg">
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Réduction ({promoApplied.code}):
                      </span>
                      <span className="font-bold text-green-600">-{discount.toFixed(2)} DA</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Livraison:</span>
                    <span className={`font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} DA`}
                    </span>
                  </div>
                  
                  {deliveryRate && (
                    <div className="mb-4 bg-blue-50 px-3 py-2 rounded-lg text-xs text-blue-700">
                      <span className="font-bold">Délai:</span> {deliveryRate.delai_livraison}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 bg-clip-text text-transparent">
                      {totalPrice.toFixed(2)} DA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
