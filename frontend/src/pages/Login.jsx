import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { loginWithEmail, resendEmailVerification } from '../utils/authHelpers';
import LoadingOverlay from '../components/LoadingOverlay';

/**
 * Enhanced Login Component with Email Verification Check
 * 
 * Features:
 * - Firebase email/password login
 * - Blocks unverified emails from logging in
 * - Shows verification status
 * - Resend verification email option
 * - Integrates with backend auth
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Verification state
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  /**
   * Handle login with verification check
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setShowResendEmail(false);
    
    try {
      // Step 1: Firebase login with verification check
      const firebaseResult = await loginWithEmail(email, password);
      
      if (!firebaseResult.success) {
        throw new Error('Login failed');
      }
      
      // Check verification status
      if (!firebaseResult.emailVerified) {
        setUnverifiedEmail(email);
        setShowResendEmail(true);
        toast.error('Email not verified. Please check your inbox.');
        return;
      }
      
      // Log verification status
      console.log('✅ Email verified:', firebaseResult.emailVerified);
      console.log('📱 Phone verified:', firebaseResult.phoneVerified);
      
      // Step 2: Login to backend (if you have backend auth)
      // This is optional - remove if you only use Firebase
      const backendResult = await login(email, password);
      
      if (backendResult.success) {
        toast.success('Welcome back! 🎉');
        navigate('/');
      } else {
        // Backend login failed but Firebase succeeded
        // You might want to handle this case
        toast.success('Firebase login successful');
        navigate('/');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if error is about email verification
      if (error.message.includes('verify your email')) {
        setUnverifiedEmail(email);
        setShowResendEmail(true);
      }
      
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend email verification
   */
  const handleResendVerification = async () => {
    setLoading(true);
    
    try {
      // First, sign in to Firebase (without completing login)
      const { auth } = await import('../firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      await signInWithEmailAndPassword(auth, unverifiedEmail, password);
      
      // Send verification email
      const result = await resendEmailVerification();
      toast.success(result.message);
      
      // Sign out immediately
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-rose-50 px-4 py-12">
      {loading && <LoadingOverlay />}
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your Glimmr account</p>
          </div>

          {/* Email verification warning */}
          {showResendEmail && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Email not verified
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please verify your email to login. Check your inbox for the verification link.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-2 text-xs text-amber-700 hover:text-amber-800 font-semibold underline disabled:opacity-50"
                  >
                    Resend verification email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-semibold">
                Sign up
              </Link>
            </p>
            <p className="text-gray-600">
              <Link to="/otp-login" className="text-blue-600 hover:text-blue-700 font-semibold">
                🔑 Login with OTP
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>🔒 Secure Login:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Email must be verified to login</li>
              <li>Phone verification recommended</li>
              <li>Your data is encrypted and secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
