import React from 'react';
import { Heart, Facebook, Instagram, Phone, Mail, Sparkles,Moon, Code } from 'lucide-react';

export default function Footer({ showMenu }) {
  return (
    <footer className={`bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 text-gray-800 transition-all duration-300 ${showMenu ? 'lg:ml-64' : ''} border-t-4 border-pink-200`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          
          {/* Section Logo et Description */}
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Sparkles className="w-7 h-7 text-pink-600 animate-pulse" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 bg-clip-text text-transparent">
                Imi Chique Boutique
              </h3>
              <Moon className="w-7 h-7 text-purple-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed font-medium" style={{ direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
                ✨ متجر إلكتروني يوفر كل مايهم الأنثى من مواد العناية وإكسسوارات وعطور أصلية ✨
              </p>
              <p className="text-sm text-pink-600 font-semibold" style={{ direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
                🌸 جمالك هو شغفنا 🌸
              </p>
            </div>
          </div>

          {/* Section Réseaux Sociaux */}
          <div className="text-center space-y-4">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 bg-clip-text text-transparent">Suivez-nous</h4>
            <div className="flex items-center justify-center gap-3">
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

          {/* Section Contact */}
          <div className="text-center md:text-right space-y-4">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 bg-clip-text text-transparent">Contactez-nous</h4>
            <a 
              href="tel:+213560724695" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <Phone className="w-5 h-5" />
              <span>+213 560 72 46 95</span>
            </a>
          </div>
        </div>

         {/* Divider girly */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex-1 border-t-2 border-pink-300"></div>
          <Heart className="w-5 h-5 fill-pink-400 text-pink-400" />
          <div className="flex-1 border-t-2 border-pink-300"></div>
        </div>

        {/* Copyright et signature */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="flex items-center gap-2 text-gray-800">
            © 2025 Imi Chique Boutique - Fait avec 
            <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" /> 
            en Algérie
          </p>
          <p className="flex items-center gap-2 text-xs">
  <Code className="w-4 h-4 text-purple-500" />
  <span className="text-gray-800">Développé par</span>
  <a
    href="https://www.instagram.com/meryacode/"
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:underline"
  >
    Y-Meriem
  </a>
</p>

        </div>
      </div>
    </footer>
  );
}
