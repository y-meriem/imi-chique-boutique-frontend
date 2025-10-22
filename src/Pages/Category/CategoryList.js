// frontend/src/Pages/Category/CategoryList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import Layout from '../../components/layout/Layout';
import { Trash2 ,Edit} from 'lucide-react';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ ERREUR loadCategories:', err);
      setError(err.message || 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${nom}" ?`)) {
      try {
        await categoryService.deleteCategory(id);
        alert('✨ Catégorie supprimée avec succès!');
        loadCategories();
      } catch (err) {
        console.error('❌ ERREUR deleteCategory:', err);
        alert(`❌ ${err.message || 'Erreur lors de la suppression'}`);
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-30 to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-bold text-gray-700">Chargement des catégories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-30 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">
                  🏷️ Catégories
                </h1>
                <p className="text-gray-600">
                  Gérez vos catégories de produits
                </p>
              </div>
              <Link
                to="/categories/add"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-400 text-white rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-center"
              >
                + Nouvelle Catégorie
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl font-semibold bg-red-50 text-red-700 border-l-4 border-red-500">
                ❌ {error}
              </div>
            )}

            {/* Recherche */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                  🔍
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-4 border border-pink-200">
              <p className="text-base font-bold text-gray-700">
                📊 Total: <span className="text-pink-600">{filteredCategories.length}</span> catégorie(s)
              </p>
            </div>
          </div>

          {/* Liste des catégories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl font-bold text-gray-600">Aucune catégorie trouvée</p>
                <p className="text-gray-500 mt-2">Commencez par ajouter votre première catégorie</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {/* Image de la catégorie */}
                  {category.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${category.image_url}`}
                        alt={category.nom}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="48" fill="%239ca3af"%3E🏷️%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        #{category.id}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center relative">
                      <span className="text-7xl">🏷️</span>
                      <div className="absolute top-3 right-3 bg-white text-pink-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        #{category.id}
                      </div>
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                      {category.nom}
                    </h3>

                    <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">📅 Créé:</span>
                        <span>{new Date(category.created_at).toLocaleDateString('fr-FR')}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">🔄 Modifié:</span>
                        <span>{new Date(category.updated_at).toLocaleDateString('fr-FR')}</span>
                      </p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2">
                       <Link
                        to={`/categories/update/${category.id}`}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-bold text-center text-sm shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.nom)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all font-bold text-sm shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryList;
