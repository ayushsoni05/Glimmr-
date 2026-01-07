import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        {/* Success Icon */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 100,
            }}
            className="relative w-24 h-24 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 animate-pulse"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-4 border-transparent border-t-green-500 border-r-emerald-500 rounded-full"
            ></motion.div>
            <span className="text-6xl z-10">✓</span>
          </motion.div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Your order has been placed successfully
          </p>
          <p className="text-gray-600">
            We're processing your order and will send you updates soon
          </p>
        </motion.div>

        {/* Order Details Card */}
        {orderData && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Order Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-1">Order ID</p>
                <p className="text-lg font-mono text-gray-900 break-all">
                  {orderData._id || 'Processing...'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-1">Order Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {orderData.createdAt
                    ? new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : new Date().toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Amount</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{orderData.totalAmount ? orderData.totalAmount.toLocaleString('en-IN') : '0'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-1">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {orderData.paymentMethod || 'COD'}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <p className="text-sm text-gray-600 font-semibold mb-3">📍 Shipping Address</p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="font-semibold text-gray-900 mb-1">
                  {orderData.shippingAddress?.name || 'N/A'}
                </p>
                <p className="text-gray-700">
                  {orderData.shippingAddress?.line1}
                  {orderData.shippingAddress?.line2 && `, ${orderData.shippingAddress.line2}`}
                </p>
                <p className="text-gray-700">
                  {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} -{' '}
                  {orderData.shippingAddress?.pincode}
                </p>
                <p className="text-gray-600 mt-2">
                  📞 {orderData.shippingAddress?.phone}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages Section */}
        <motion.div
          variants={itemVariants}
          className="space-y-4 mb-8"
        >
          <div className="bg-green-50 border-2 border-green-300 p-5 rounded-xl">
            <p className="text-green-800 font-semibold flex items-center gap-2">
              <span className="text-xl">✓</span>
              Order Confirmation Email Sent
            </p>
            <p className="text-sm text-green-700 mt-1">
              Check your email for detailed order information and tracking updates
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 p-5 rounded-xl">
            <p className="text-blue-800 font-semibold flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              What Happens Next?
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-6 list-disc">
              <li>We'll verify your order within 1-2 hours</li>
              <li>You'll receive an SMS with tracking details</li>
              <li>Your items will be packed and dispatched soon</li>
              <li>Check your orders page for real-time updates</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-xl">
            <p className="text-amber-800 font-semibold flex items-center gap-2">
              <span className="text-xl">💬</span>
              Need Help?
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Our support team is available 24/7. Contact us via email or phone if you have any questions.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile?tab=orders')}
            className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>📋</span>
            View Order Status
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/collections')}
            className="flex-1 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <span>🛍️</span>
            Continue Shopping
          </motion.button>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Order ID saved to your profile for future reference
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Follow your order in the Orders tab of your profile
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
