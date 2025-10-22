// pages/AddProduct.js
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import productService from '../../services/productService';
import {useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    revenu: 0,
    prix: 0,
    promo: '',
    categorie_id: '', 
    statut: 'actif'
  });

  const [couleurs, setCouleurs] = useState([{ couleur: '', code_couleur: '#ec4899' }]);
  const [tailles, setTailles] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageColors, setImageColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);
  const [stock, setStock] = useState({});
  const navigate = useNavigate();
  

  const taillesDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const [categories, setCategories] = useState([]);
 useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      setCategories([]);
    }
  };
  
  loadCategories();
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCouleurChange = (index, field, value) => {
    const newCouleurs = [...couleurs];
    newCouleurs[index][field] = value;
    setCouleurs(newCouleurs);
  };

  const addCouleur = () => {
    setCouleurs([...couleurs, { couleur: '', code_couleur: '#ec4899' }]);
  };

  const removeCouleur = (index) => {
    if (couleurs.length > 1) {
      setCouleurs(couleurs.filter((_, i) => i !== index));
    }
  };

  const handleTailleToggle = (taille) => {
    setTailles(prev => 
      prev.includes(taille) 
        ? prev.filter(t => t !== taille)
        : [...prev, taille]
    );
  };

  const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length > 10) {
    setMessage({ type: 'error', text: 'Maximum 10 images autorisées' });
    return;
  }

  setImages(files);
  setImageColors(new Array(files.length).fill(''));

  const previews = files.map(file => URL.createObjectURL(file));
  setImagePreviews(previews);
};

const handleImageColorChange = (index, value) => {
  const newImageColors = [...imageColors];
  newImageColors[index] = value;
  setImageColors(newImageColors);
};

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImageColors = imageColors.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    setImageColors(newImageColors);
  };

  const validateForm = () => {
    if (!formData.titre.trim()) {
      setMessage({ type: 'error', text: 'Le titre est requis' });
      return false;
    }
    if (!formData.categorie_id) {
  setMessage({ type: 'error', text: 'La catégorie est requise' });
  return false;
}
    if (formData.prix <= 0) {
      setMessage({ type: 'error', text: 'Le prix doit être supérieur à 0' });
      return false;
    }
    if (formData.revenu < 0) {
      setMessage({ type: 'error', text: 'Le revenu ne peut pas être négative' });
      return false;
    }

    const couleursValides = couleurs.filter(c => c.couleur.trim() !== '');
    if (couleursValides.length === 0) {
      setMessage({ type: 'error', text: 'Au moins une couleur est requise' });
      return false;
    }

  

    if (images.length === 0) {
      setMessage({ type: 'error', text: 'Au moins une image est requise' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const couleursValides = couleurs.filter(c => c.couleur.trim() !== '');
      const couleursAvecStock = couleursValides.map((couleur, index) => ({
        ...couleur,
        quantite: tailles.length === 0 ? (stock[`couleur_${index}`] || 0) : undefined
      }));


      const productData = {
        ...formData,
        couleurs: couleursValides,
        tailles: tailles,
          stock: tailles.length > 0 ? stock : undefined // Stock détaillé si tailles présentes

      };

      const result = await productService.createProduct(productData, images, imageColors);

      if (result.success) {
        setMessage({ type: 'success', text: '✨ Produit ajouté avec succès!' });
        
        setFormData({
          titre: '',
          description: '',
          revenu: 0,
          prix: 0,
          promo: '',
          categorie_id: '',
          statut: 'actif'
        });
        setCouleurs([{ couleur: '', code_couleur: '#ec4899' }]);
        setTailles([]);
        setImages([]);
        setImagePreviews([]);
        setImageColors([]);

        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ ${error.message || 'Erreur lors de l\'ajout du produit'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ?')) {
      setFormData({
        titre: '',
        description: '',
        revenu: 0,
        prix: 0,
        promo: '',
       categorie_id: '',
        statut: 'actif'
      });
      setCouleurs([{ couleur: '', code_couleur: '#ec4899' }]);
      setTailles([]);
      setImages([]);
      setImagePreviews([]);
      setImageColors([]);
      setMessage({ type: '', text: '' });
    }
  };
   const handleGoBack = () => {
    navigate('/products');
};

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
             <button
                    onClick={handleGoBack}
                    className="flex items-center gap-1 text-pink-600 font-bold mb-3 hover:text-pink-700 transition text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Retour
                  </button>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-pink-100">
    
          {/* Header - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-pink-500 to-pink-300 p-3 rounded-2xl shadow-lg">
                <span className="text-2xl sm:text-3xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-300">
                  Nouveau Produit
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Ajoutez un produit à votre catalogue
                </p>
              </div>
            </div>
          </div>

          {/* Message de notification - Mobile Optimized */}
          {message.text && (
            <div 
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl font-semibold text-sm sm:text-base shadow-lg ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-500' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-l-4 border-red-500'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Informations de base */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-40 p-4 sm:p-6 rounded-2xl border border-pink-200 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span>Informations</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Titre <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    placeholder="Ex: T-Shirt Premium"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Catégorie <span className="text-pink-500">*</span>
                  </label>
                <select
  name="categorie_id"
  value={formData.categorie_id}
  onChange={handleInputChange}
  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
>
  <option value="">Choisir...</option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.nom}</option>
  ))}
</select>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Décrivez votre produit..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition resize-none text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Revenu (DA) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="revenu"
                    value={formData.revenu}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Prix (DA) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Promo (DA)
                  </label>
                  <input
                    type="number"
                    name="promo"
                    value={formData.promo}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
                  >
                    <option value="actif">✅ Actif</option>
                    <option value="inactif">❌ Inactif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Couleurs */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-40 p-4 sm:p-6 rounded-2xl border border-pink-200 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  <span>Couleurs</span>
                </h2>
                <button
                  type="button"
                  onClick={addCouleur}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base"
                >
                  + Ajouter
                </button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {couleurs.map((couleur, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center bg-white p-3 rounded-xl shadow-md border border-pink-100">
                    <input
                      type="text"
                      placeholder="Nom couleur"
                      value={couleur.couleur}
                      onChange={(e) => handleCouleurChange(index, 'couleur', e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={couleur.code_couleur}
                        onChange={(e) => handleCouleurChange(index, 'code_couleur', e.target.value)}
                        className="h-10 w-16 sm:w-20 rounded-lg cursor-pointer border-2 border-pink-200"
                      />
                      <span className="text-xs sm:text-sm text-gray-600 font-mono">
                        {couleur.code_couleur}
                      </span>
                    </div>
                    {couleurs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCouleur(index)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-bold active:scale-95"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tailles */}
            <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-4 sm:p-6 rounded-2xl border border-indigo-200 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📏</span>
                <span>Tailles</span>
                <span className="text-xs text-gray-500 font-normal">(optionnel)</span>
              </h2>
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {taillesDisponibles.map((taille) => (
                  <button
                    key={taille}
                    type="button"
                    onClick={() => handleTailleToggle(taille)}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base ${
                      tailles.includes(taille)
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white scale-105'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-pink-200 border-2 border-pink-200'
                    }`}
                  >
                    {taille}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Stock */}
<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border border-green-200 shadow-lg">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-2xl">📦</span>
    <span>Stock / Quantités</span>
  </h2>

  {couleurs.filter(c => c.couleur.trim()).length === 0 ? (
    <p className="text-gray-500 text-sm">Ajoutez d'abord des couleurs</p>
  ) : tailles.length === 0 ? (
    // CAS 1: Stock par couleur uniquement (pas de tailles)
    <div className="space-y-3">
      {couleurs.filter(c => c.couleur.trim()).map((couleur, index) => (
        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border border-green-100">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: couleur.code_couleur }}
          />
          <span className="flex-1 font-semibold text-gray-700">
            {couleur.couleur}
          </span>
          <input
            type="number"
            min="0"
            placeholder="Qté"
            value={stock[`couleur_${index}`] || ''}
            onChange={(e) => {
              const newStock = { ...stock };
              newStock[`couleur_${index}`] = parseInt(e.target.value) || 0;
              setStock(newStock);
            }}
            className="w-24 px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-bold"
          />
          <span className="text-sm text-gray-500">unités</span>
        </div>
      ))}
    </div>
  ) : (
    // CAS 2: Stock par combinaison (couleur + taille)
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
        <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <tr>
            <th className="px-4 py-3 text-left font-bold">Couleur</th>
            {tailles.map(taille => (
              <th key={taille} className="px-4 py-3 text-center font-bold">{taille}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {couleurs.filter(c => c.couleur.trim()).map((couleur, cIndex) => (
            <tr key={cIndex} className="border-b border-gray-100 hover:bg-green-50/50 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border-2 border-gray-300"
                    style={{ backgroundColor: couleur.code_couleur }}
                  />
                  <span className="font-semibold text-gray-700">{couleur.couleur}</span>
                </div>
              </td>
              {tailles.map(taille => {
                const stockKey = `${couleur.couleur.toLowerCase().trim()}_${taille.toLowerCase()}`;
                return (
                  <td key={taille} className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={stock[stockKey] || ''}
                      onChange={(e) => {
                        const newStock = { ...stock };
                        newStock[stockKey] = parseInt(e.target.value) || 0;
                        setStock(newStock);
                      }}
                      className="w-16 px-2 py-1.5 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-bold text-sm"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

            {/* Images */}
       <div className="bg-gradient-to-br from-pink-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border border-pink-200 shadow-lg">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-2xl">📷</span>
    <span>Images</span>
  </h2>
  
  <div className="mb-4">
    <label className="block w-full">
      <div className="border-2 border-dashed border-pink-300 rounded-2xl p-6 sm:p-8 text-center hover:border-pink-500 hover:bg-pink-50/50 transition-all duration-300 cursor-pointer bg-white">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="text-gray-600">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 via-[#f77fbe] to-pink-300 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-700">Sélectionner images</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Max 10 images</p>
        </div>
      </div>
    </label>
  </div>

  {images.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {images.map((img, index) => (
        <div key={index} className="relative bg-white p-2 sm:p-3 rounded-xl shadow-lg border-2 border-pink-100 hover:border-pink-300 transition-all">
          <img
            src={imagePreviews[index]}
            alt={`Preview ${index + 1}`}
            className="w-full h-24 sm:h-32 object-cover rounded-lg mb-2"
          />
          <select
            value={imageColors[index]}
            onChange={(e) => handleImageColorChange(index, e.target.value)}
            className="w-full px-2 py-1 border-2 border-pink-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Couleur générale</option>
            {couleurs.filter(c => c.couleur.trim()).map((c, i) => (
              <option key={i} value={c.couleur}>{c.couleur}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-bold text-sm shadow-lg active:scale-90"
          >
            ✕
          </button>
          {index === 0 && (
            <span className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              ★
            </span>
          )}
        </div>
      ))}
    </div>
  )}
</div>

            {/* Boutons d'action - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
           <button
  type="submit"
  disabled={loading}
  className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-white font-black text-base sm:text-lg transition-all duration-300 shadow-xl ${
    loading
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 hover:shadow-2xl active:scale-95'
  }`}
>
  {loading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Ajout en cours...
    </span>
  ) : (
    '✨ Ajouter le Produit'
  )}
</button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl font-bold hover:from-gray-300 hover:to-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 text-base sm:text-lg"
              >
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddProduct;
