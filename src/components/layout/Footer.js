import React from 'react';
import { Heart, Facebook, Instagram, Phone, Mail, Sparkles,Moon, Code } from 'lucide-react';

export default function Footer({ showMenu }) {
  return (
    <footer className={`bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 text-gray-800 transition-all duration-300 ${showMenu ? 'lg:ml-64' : ''} border-t-4 border-pink-200`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Logo et réseaux sociaux */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h3 className="text-2xl font-bold text-pink-600">Imi Chique Boutique</h3>
            <Moon className="w-6 h-6 text-pink-500" />
          </div>
          
          {/* Icônes sociales */}
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://www.facebook.com/Imichiqueboutique/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-pink-200 hover:bg-pink-300 p-3 rounded-full transition transform hover:scale-110"
            >
              <Facebook className="w-5 h-5 text-pink-600" />
            </a>

            <a 
              href="https://www.instagram.com/imi_chique_boutique" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-pink-200 hover:bg-pink-300 p-3 rounded-full transition transform hover:scale-110"
            >
              <Instagram className="w-5 h-5 text-pink-600" />
            </a>

            <a 
              href="https://www.tiktok.com/@imichiqueboutique?_t=ZS-90WNZbceEGl&_r=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-pink-200 hover:bg-pink-300 p-3 rounded-full transition transform hover:scale-110"
            >
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Contact rapide */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 mb-4">
          <a href=" +213 560 72 46 96" className="flex items-center gap-1 hover:text-pink-500 transition">
            <Phone className="w-4 h-4" />
             +213 560 72 46 95
          </a>          
        </div>

        {/* Copyright et signature */}
        <div className="text-center text-sm text-gray-600 border-t border-pink-200 pt-4 space-y-2">
          <p className="flex items-center justify-center gap-1">
            © 2025 Imi Chique Boutique - Fait avec <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> en Algérie
          </p>
          <p className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Code className="w-3 h-3 text-purple-400" />
             <span className="font-semibold text-purple-600">Y-Meriem</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
