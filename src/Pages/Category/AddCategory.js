// frontend/src/Pages/Category/AddCategory.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import categoryService from '../../services/categoryService';
import Layout from '../../components/layout/Layout';

const AddCategory = () => {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    navigate('/categories');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP');
        return;
      }
      
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image est trop volumineuse (max 5MB)');
        return;
      }

      setImage(file);
      setError(null);
      
      // Créer l'aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!nom.trim()) {
      setError('Le nom de la catégorie est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await categoryService.createCategory({ 
        nom: nom.trim(),
        image: image 
      });
      alert('✨ Catégorie ajoutée avec succès!');
      navigate('/categories');
    } catch (err) {
      console.error('❌ ERREUR createCategory:', err);
      setError(err.message || 'Erreur lors de l\'ajout de la catégorie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 text-pink-600 font-bold mb-3 hover:text-pink-700 transition text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-pink-100">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-pink-500 to-pink-300 p-3 rounded-2xl shadow-lg">
                  <span className="text-3xl">✨</span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400">
                    Nouvelle Catégorie
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Ajoutez une catégorie à votre catalogue
                  </p>
                </div>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl font-semibold bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-l-4 border-red-500 shadow-lg">
                ❌ {error}
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-50 p-6 rounded-2xl border border-pink-200 shadow-lg">
                <label htmlFor="nom" className="block text-lg font-bold text-gray-800 mb-3">
                  Nom de la catégorie <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Électronique, Vêtements, Alimentation..."
                  className="w-full px-6 py-4 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-lg shadow-md"
                  disabled={loading}
                  required
                />
                <p className="text-sm text-gray-600 mt-3 italic">
                  💡 Le nom doit être unique et représentatif
                </p>
              </div>

              {/* Image */}
              <div className="bg-gradient-to-br from-pink-50 to-indigo-50 p-6 rounded-2xl border border-pink-200 shadow-lg">
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  Image de la catégorie <span className="text-gray-500 text-sm">(optionnel)</span>
                </label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center hover:border-pink-500 transition-colors">
                    <input
                      type="file"
                      id="image"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <div className="text-6xl mb-3">🖼️</div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        Cliquez pour choisir une image
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, GIF ou WebP (max 5MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                      <span>✅</span>
                      <span className="font-semibold">{image?.name}</span>
                      <span className="text-gray-400">
                        ({(image?.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-4 px-6 rounded-2xl text-white font-black text-lg transition-all duration-300 shadow-xl ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 hover:from-pink-600 hover:via-pink-500 hover:to-pink-400 hover:shadow-2xl active:scale-95'
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
                    '✨ Ajouter la Catégorie'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddCategory;