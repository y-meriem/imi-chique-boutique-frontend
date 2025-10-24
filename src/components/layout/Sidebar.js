import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Truck, Heart, Package, Gift, Star, User, Tag, LogOut, ShoppingCart, UserPlus, LogIn } from "lucide-react";
import { userService } from "../../services/userService";

export default function Sidebar({ showMenu, setShowMenu, cart, favorites }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupérer l'utilisateur connecté
  const currentUser = userService.getCurrentUser();
  const isAuthenticated = userService.isAuthenticated();
  const isAdmin = currentUser?.type === 'admin';
  const isUser = currentUser?.type === 'user';

  // Menu pour Admin
  const adminMenuItems = [
    { icon: Star, text: "Statistiques", path: "/statistics" },
    { icon: Package, text: "Commandes", path: "/orders" },
    { icon: Home, text: "Boutique", path: "/" },
    { icon: ShoppingBag, text: "Produits", path: "/products" },
    { icon: Gift, text: "Catégories", path: "/categories" },
    { icon: Tag, text: "Codes Promo", path: "/promo-management" }, 
    { icon: Heart, text: "Avis", path: "/avis-management" },
    { icon: Truck, text: "Livraison", path: "/livraisons" },
    { icon: User, text: "Mon Profile", path: "/profile" },
    { icon: User, text: "Users", path: "/user-management" },
  ];

  // Menu pour User connecté
  const userMenuItems = [
    { icon: Home, text: "Accueil", path: "/" },
    { icon: Heart, text: "Mes Favoris", path: "/favorites", badge: favorites?.length || 0 },
    { icon: Star, text: "Mes Avis", path: "/my-avis" },
    { icon: Package, text: "Mes Commandes", path: "/mes-commandes" },
    { icon: User, text: "Mon Profile", path: "/profile" },
  ];

  // Menu pour Visiteur (non connecté)
  const guestMenuItems = [
    { icon: Home, text: "Accueil", path: "/" },
  ];

  // Choisir le menu approprié
  let menuItems = guestMenuItems;
  if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isUser) {
    menuItems = userMenuItems;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    userService.logout();
    setShowMenu(false);
    navigate('/login');
  };

  return (
    <>
      {/* Overlay - Visible seulement sur mobile */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 lg:hidden" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 lg:top-20 left-0 h-full lg:h-[calc(100vh-5rem)] w-64 
          bg-gradient-to-b from-white to-pink-50 shadow-2xl z-50
          transition-transform duration-300 ease-in-out overflow-y-auto
          ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group ${
                    active 
                      ? 'bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white border-pink-500' 
                      : 'bg-white border border-pink-100 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                      active 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-r from-pink-400 to-rose-400'
                    }`}>
                      <Icon className={`w-5 h-5 text-white`} />
                    </div>
                    <span className={`font-semibold transition-colors ${
                      active 
                        ? 'text-white' 
                        : 'text-gray-700 group-hover:text-pink-600'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${
                      active 
                        ? 'bg-white text-pink-600' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Boutons pour visiteur non connecté */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group bg-white border border-green-100 hover:border-green-300 mt-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-r from-green-400 to-emerald-400">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                      Créer un compte
                    </span>
                  </div>
                </Link>

                <Link
                  to="/login"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group bg-white border border-blue-100 hover:border-blue-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-r from-blue-400 to-indigo-400">
                      <LogIn className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      Se connecter
                    </span>
                  </div>
                </Link>
              </>
            )}

            {/* Bouton de déconnexion pour utilisateurs connectés */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group bg-white border border-red-100 hover:border-red-300 mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-r from-red-400 to-rose-400">
                    <LogOut className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-red-600 transition-colors">
                    Déconnexion
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-pink-200">
            <div className="text-center">
              <p className="text-xs text-gray-400">© Imi Chique Boutique</p>
              {isAuthenticated && (
                <p className="text-xs text-pink-500 font-semibold mt-1">
                  {currentUser?.prenom} {currentUser?.nom} ({isAdmin ? 'Admin' : 'Client'})
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
