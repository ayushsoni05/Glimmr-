import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import api from '../api';
import { CheckCircleIcon, AlertCircleIcon } from '../components/Icons';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post('/auth/verify-email', { token, email });
        setVerified(true);
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {loading ? (
          <>
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
            <p className="text-gray-600">Verifying your email...</p>
          </>
        ) : verified ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-amber-700 mb-4 flex justify-center"
            >
              <CheckCircleIcon size={60} />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Welcome to Glimmr!
            </p>
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-red-700 mb-4 flex justify-center"
            >
              <AlertCircleIcon size={60} />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <Link to="/auth" className="btn-secondary flex-1">
                Back to Auth
              </Link>
              <Link to="/" className="btn-primary flex-1">
                Home
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
