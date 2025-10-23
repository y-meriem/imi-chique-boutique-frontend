import React, { useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ showCart, setShowCart, cart, updateCartItem, removeFromCart, clearCart }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  // Fonction pour appliquer le code promo
  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoError('');
    
    try {
        const response = await fetch(`${API_URL}/api/promo/verify`, {
          method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase() })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setPromoApplied(data.promo);
        setPromoError('');
      } else {
        setPromoError(data.message);
        setPromoApplied(null);
      }
    } catch (error) {
      setPromoError('Erreur lors de la vérification');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoApplied(null);
    setPromoError('');
  };

  // Calculs
  const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
  const discount = promoApplied 
    ? promoApplied.pourcentage_reduction 
      ? (subtotal * promoApplied.pourcentage_reduction) / 100
      : Math.min(promoApplied.montant_reduction || 0, subtotal)
    : 0;
  const totalPrice = subtotal - discount;

  return (
    <>
      {/* Overlay */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-pink-500" />
                Mon Panier
              </h2>
              <button 
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full hover:bg-pink-100 transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-600 font-medium">Votre panier est vide</p>
                <p className="text-sm text-gray-400 mt-2">Ajoutez des produits pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="bg-pink-50 rounded-2xl p-3 flex gap-3">
                    <img 
                      src={item.image} 
                      alt={item.titre}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{item.titre}</h3>
                      
                      {/* Afficher couleur et taille */}
                      <div className="flex gap-2 items-center mt-1">
                        {item.couleur && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.couleur.code }}
                            />
                            <span className="text-xs text-gray-600">{item.couleur.nom}</span>
                          </div>
                        )}
                        {item.taille && (
                          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-lg font-medium">
                            {item.taille}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-pink-600 font-bold text-sm mt-1">{item.prix} DA</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartItem(item.cartItemId, item.quantity - 1)}
                          className="p-1 bg-white rounded-lg shadow hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="font-bold text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.quantiteStock}
                          className="p-1 bg-white rounded-lg shadow hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  Vider le panier
                </button>

                {/* Section Code Promo */}
                <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                  <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-pink-500" />
                    Code Promo
                  </p>
                  
                  {!promoApplied ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Entrez votre code"
                        className="flex-1 px-3 py-2 border-2 border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600 disabled:opacity-50 text-sm transition"
                      >
                        {promoLoading ? '...' : 'Appliquer'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-100 px-3 py-2 rounded-lg">
                      <span className="text-sm font-bold text-green-700">
                        ✓ {promoApplied.code} (-{promoApplied.pourcentage_reduction ? `${promoApplied.pourcentage_reduction}%` : `${promoApplied.montant_reduction} DA`})
                      </span>
                      <button 
                        onClick={removePromoCode} 
                        className="text-red-500 text-sm font-bold hover:text-red-700 transition"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {promoError && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <span>❌</span> {promoError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-bold text-gray-800">{subtotal.toFixed(2)} DA</span>
                </div>
                
                {promoApplied && discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Réduction:
                    </span>
                    <span className="font-bold text-green-600">-{discount.toFixed(2)} DA</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-pink-200">
                  <span className="font-bold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {totalPrice.toFixed(2)} DA
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setShowCart(false);
                  // Sauvegarder les infos promo pour le checkout
                  localStorage.setItem('promoApplied', JSON.stringify(promoApplied));
                  navigate('/checkout'); 
                }}
                className="w-full bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300  text-white py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Commander
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
