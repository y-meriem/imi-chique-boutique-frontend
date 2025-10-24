import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Heart, Sparkles, Shield, ArrowLeft, AlertCircle, Star, RefreshCw, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await userService.verifyResetCode(email, code);
      // Code valide, aller à la réinitialisation
      navigate('/reset-password', { state: { email, code } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setResendSuccess(false);
    try {
      await userService.forgotPassword(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
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
                  <Shield className="w-7 h-7 md:w-8 md:h-8 text-pink-500" />
                  Vérification du code
                </h2>
                <p className="text-base md:text-lg text-gray-500 mb-2">
                  Code envoyé à 💌
                </p>
                <p className="text-sm md:text-base font-bold text-pink-600">
                  {email}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {resendSuccess && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm font-medium">Nouveau code envoyé ! 📬</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Code Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-center gap-1">
                    <Shield className="w-4 h-4 text-pink-500" />
                    Code de vérification (6 chiffres)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength="6"
                      pattern="\d{6}"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      className="w-full px-4 py-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 shadow-sm transition-all hover:shadow-md text-center text-3xl tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Entre les 6 chiffres reçus par email
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-gradient-to-r from-pink-400 via-[#f77fbe] to-pink-300 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-[#f77fbe] to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Vérification...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 animate-pulse" />
                        Vérifier
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </span>
                </button>

                {/* Action Links */}
                <div className="text-center pt-4 space-y-3">
                  <button
                    type="button"
                    onClick={resendCode}
                    className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-[#f77fbe] to-pink-300 hover:from-pink-600 hover:to-purple-600 transition-all"
                  >
                    <RefreshCw className="w-4 h-4 text-pink-500" />
                    Renvoyer le code
                  </button>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-sm md:text-base text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      Annuler et retourner à la connexion
                    </button>
                  </div>
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

export default VerifyCode;
