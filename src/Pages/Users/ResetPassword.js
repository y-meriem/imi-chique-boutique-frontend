import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Heart, Sparkles, Lock, ArrowLeft, AlertCircle, Star, CheckCircle, Key } from 'lucide-react';
import Layout from '../../components/layout/Layout';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const code = location.state?.code || '';
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await userService.resetPassword(email, code, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/3 w-36 h-36 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* Floating Icons */}
          <div className="absolute top-1/4 left-1/4 animate-bounce" style={{animationDuration: '3s'}}>
            <Star className="w-6 h-6 text-pink-300 opacity-40" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
            <Heart className="w-5 h-5 text-purple-300 opacity-40" />
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}>
            <Sparkles className="w-6 h-6 text-blue-300 opacity-40" />
          </div>
        </div>

        <div className="max-w-2xl w-full relative z-10">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-pink-100 relative overflow-hidden">
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-200 to-pink-200 rounded-tr-full opacity-50"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
                  <Key className="w-7 h-7 md:w-8 md:h-8 text-pink-500" />
                  Nouveau mot de passe
                </h2>
                <p className="text-base md:text-lg text-gray-500">Choisis un mot de passe sécurisé 🔐</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm font-medium">✅ Mot de passe modifié ! Redirection...</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Lock className="w-4 h-4 text-pink-500" />
                    Nouveau mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      name="newPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Minimum 6 caractères
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Lock className="w-4 h-4 text-purple-500" />
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-pink-400 via-[#f77fbe] to-pink-300 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-[#f77fbe] to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Modification...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Succès !
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5 animate-pulse" />
                        Changer le mot de passe
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </span>
                </button>

                {/* Back to Login Link */}
                <div className="text-center pt-4">
                  <p className="text-sm md:text-base text-gray-600">
                    Tu te souviens maintenant ? 💭{' '}
                    <Link to="/login" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 hover:from-pink-600 hover:to-purple-600">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-gray-800 font-medium bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
