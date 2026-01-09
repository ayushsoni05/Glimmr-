import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmailFrontend } from '../utils/emailValidator';
import InvalidEmailModal from '../components/InvalidEmailModal';
import api from '../api';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [invalidEmailModal, setInvalidEmailModal] = useState({
    isOpen: false,
    error: '',
    message: '',
    suggestion: null
  });

  const { login, signup, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (isAdminLogin) {
          // Admin login with 2FA
          console.log('[Auth] Admin login attempt:', { email, hasPassword: !!password, hasTwoFACode: !!twoFACode });
          
          if (!email || !password) {
            setError('Email and password are required');
            setLoading(false);
            return;
          }

          const payload = {
            email: email.toLowerCase().trim(),
            password
          };

          if (requiresTwoFA && twoFACode) {
            payload.twoFACode = twoFACode;
          }

          const response = await api.post('/auth/admin-login', payload);

          if (response.data.requiresTwoFA) {
            setRequiresTwoFA(true);
            setMessage(response.data.message);
            setLoading(false);
            return;
          }

          const { token, user: userData } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(userData);
          navigate('/#/admin');
          window.location.href = '/#/admin';  // Force reload to ensure admin page loads
        } else {
          // Regular login
          const result = await login(email, password);
          if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          } else {
            setError(result.error);
          }
        }
      } else {
        // Signup - validate email first
        const emailValidation = validateEmailFrontend(email);
        if (!emailValidation.isValid) {
          setInvalidEmailModal({
            isOpen: true,
            error: emailValidation.error,
            message: emailValidation.error,
            suggestion: emailValidation.suggestion,
            validationType: emailValidation.type
          });
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const result = await signup(name, email, phone, password);
        if (result.success) {
          setMessage('Account created successfully! Please login.');
          setMode('login');
          setName('');
          setEmail('');
          setPhone('');
          setPassword('');
          setConfirmPassword('');
        } else {
          if (result.error && result.error.includes('email')) {
            setInvalidEmailModal({
              isOpen: true,
              error: result.error,
              message: result.error,
              suggestion: null,
              validationType: 'backend'
            });
          } else {
            setError(result.error);
          }
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'An error occurred';
      
      if (error.response?.data?.code === 'INVALID_EMAIL') {
        setInvalidEmailModal({
          isOpen: true,
          error: errorMsg,
          message: errorMsg,
          suggestion: null,
          validationType: 'backend'
        });
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEmailModal = () => {
    setInvalidEmailModal({ isOpen: false, error: '', message: '', suggestion: null });
  };

  const handleAcceptSuggestion = () => {
    if (invalidEmailModal.suggestion) {
      setEmail(invalidEmailModal.suggestion);
      setInvalidEmailModal({ isOpen: false, error: '', message: '', suggestion: null });
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setMessage('');
    setIsAdminLogin(false);
    setAdminKey('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-400">
            {mode === 'login' ? 'Sign in to your account' : 'Join Glimmr today'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminLogin"
                checked={isAdminLogin}
                onChange={(e) => setIsAdminLogin(e.target.checked)}
                className="h-4 w-4 text-gold-400 focus:ring-gold-400 border-white/20 rounded bg-white/5"
              />
              <label htmlFor="adminLogin" className="ml-2 block text-sm text-gray-300">
                Admin Access
              </label>
            </div>
          )}

          {isAdminLogin && requiresTwoFA && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">2FA Code (Check Email)</label>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                placeholder="Enter 16-digit code from email"
                maxLength="16"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={toggleMode}
            className="text-gray-400 hover:text-gold-400 transition-colors text-sm"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'
            }
          </button>

          {mode === 'login' && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Link to="/otp-login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  🔑 Login with OTP (Email)
                </Link>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 flex items-center gap-1">
                  Phone OTP
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                    Coming Soon
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invalid Email Modal */}
      <InvalidEmailModal
        isOpen={invalidEmailModal.isOpen}
        error={invalidEmailModal.error}
        message={invalidEmailModal.message}
        suggestion={invalidEmailModal.suggestion}
        onClose={handleCloseEmailModal}
        onAcceptSuggestion={handleAcceptSuggestion}
      />
    </div>
  );
};

export default Auth;

