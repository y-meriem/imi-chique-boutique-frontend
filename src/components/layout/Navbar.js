import React from "react";
import { Menu, ShoppingBag, Sparkles, Moon } from "lucide-react";

export default function Navbar({ showMenu, setShowMenu, cart, setShowCart }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-lg border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100"
        >
          <Menu className="w-6 h-6 text-pink-500" />
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
            <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 text-pink-400 flex-shrink-0" />
            <span className="whitespace-nowrap">Imi Chique Boutique</span>
            <Moon className="w-6 h-6 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Mode, beauté & accessoires du quotidien.
          </p>
        </div>

        <button
          onClick={() => setShowCart(true)}
          className="relative p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100"
        >
          <ShoppingBag className="w-6 h-6 text-pink-500" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
