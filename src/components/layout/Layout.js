import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CartDrawer from "./CartDrawer.js";
import Footer from "./Footer";

export default function Layout({ children }) {
  // ✅ Initialisation DIRECTE depuis localStorage (pas d'attente)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [showMenu, setShowMenu] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  });

  const [showCart, setShowCart] = useState(false);

  // Gestion responsive du menu
  useEffect(() => {
    const handleResize = () => {
      setShowMenu(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Écouter les mises à jour du panier (depuis d'autres pages)
  useEffect(() => {
    const handleCartUpdate = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Fonctions de gestion du panier
  const updateCartItem = (cartItemId, quantity) => {
    const updatedCart = cart.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0);
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (cartItemId) => {
    const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navbar 
        showMenu={showMenu} 
        setShowMenu={setShowMenu} 
        cart={cart}
        setShowCart={setShowCart}
      />
      
      <Sidebar 
        showMenu={showMenu} 
        setShowMenu={setShowMenu} 
        cart={cart} 
        favorites={favorites} 
      />

      <CartDrawer 
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateCartItem={updateCartItem}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
      
      <main className={`pt-24 pb-8 px-4 transition-all duration-300 ${showMenu ? 'lg:ml-64' : ''}`}>
        {children}
      </main>
          <Footer showMenu={showMenu} />
    </div>
  );
}