import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { EmailIcon, PhoneIcon } from '../components/Icons';

const OTPLogin = () => {
  const [step, setStep] = useState('contact'); // contact, otp
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactType, setContactType] = useState('email'); // email or phone
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState('');
  const [isPhoneOTP, setIsPhoneOTP] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { setUser } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Both phone and email OTP now use backend API (Fast2SMS for phone)
      const payload = contactType === 'phone' 
        ? { phone: contact }
        : { email: contact };
      
      await api.post('/auth/request-otp-login', payload);
      
      setIsPhoneOTP(contactType === 'phone');
      setStep('otp');
      setCountdown(60);
      success(`OTP sent to your ${contactType}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Both phone and email OTP verification use backend API
      const payload = isPhoneOTP
        ? { phone: contact, otp }
        : { email: contact, otp };
      
      const response = await api.post('/auth/verify-otp-login', payload);
      
      // Store token and set up API header
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Update AuthContext with user data
      setUser(response.data.user);
      
      // Store user data in localStorage as backup
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user.id);
      
      success('Login successful!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid OTP';
      setError(errorMsg);
      showError(errorMsg);
      console.error('OTP Verification Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">OTP Login</h1>
          <p className="text-gray-400">Quick and secure passwordless login</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {step === 'contact' ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Choose Contact Method
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContactType('email')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-bold text-base ${
                    contactType === 'email'
                      ? 'border-gold-400 bg-gold-400/10 text-gold-400'
                      : 'border-white/40 bg-white/10 text-white'
                  } text-white`}
                >
                  <EmailIcon size={18} /> Email
                </button>
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-200/20 bg-gray-50/5 text-gray-400 cursor-not-allowed relative"
                >
                  <div className="flex items-center justify-center gap-2">
                    <PhoneIcon size={18} /> Phone
                  </div>
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {contactType === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={contactType === 'email' ? 'email' : 'tel'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={contactType === 'email' ? 'you@example.com' : '9876543210'}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
              />
              {contactType === 'phone' && (
                <p className="text-xs text-gray-400 mt-1">Enter 10-digit mobile number (Indian numbers only)</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <p className="text-sm text-gray-300 mb-3">
                Enter the 6-digit OTP sent to{' '}
                <strong className="text-white">{contact}</strong>
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 font-bold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('contact');
                setOtp('');
                setCountdown(0);
              }}
              className="w-full text-gray-400 hover:text-gold-400 font-semibold py-2 transition-colors"
            >
              Use Different {contactType === 'email' ? 'Email' : 'Phone'}
            </button>

            {countdown > 0 ? (
              <p className="text-center text-sm text-gray-400">
                Resend OTP in <strong className="text-white">{countdown}s</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleRequestOTP}
                className="w-full text-gold-400 hover:text-gold-300 font-semibold py-2 transition-colors"
              >
                Resend OTP
              </button>
            )}
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            Prefer password login?{' '}
            <Link to="/auth" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
              Sign In Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPLogin;
