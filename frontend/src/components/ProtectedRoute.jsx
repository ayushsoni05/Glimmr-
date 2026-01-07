import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from './LoadingOverlay';

/**
 * Protected Route Component
 * 
 * Restricts access to routes based on authentication and verification status
 * 
 * Usage:
 * <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
 * <Route path="/admin" element={<ProtectedRoute requireFullVerification><Admin /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireEmailVerification = false,
  requirePhoneVerification = false,
  requireFullVerification = false 
}) => {
  const { user, loading, emailVerified, phoneVerified, firebaseUser } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return <LoadingOverlay />;
  }

  // Check if authentication is required
  if (requireAuth && !user && !firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // Check email verification requirement
  if (requireEmailVerification && !emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
          <p className="text-gray-600 mb-6">
            Please verify your email address to access this page. Check your inbox for the verification link.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Go to Profile
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check phone verification requirement
  if (requirePhoneVerification && !phoneVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Verification Required</h2>
          <p className="text-gray-600 mb-6">
            Please verify your phone number to access this page for additional security.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Verify Phone
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check full verification (both email and phone)
  if (requireFullVerification && (!emailVerified || !phoneVerified)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Full Verification Required</h2>
          <p className="text-gray-600 mb-4">
            This page requires both email and phone verification for security.
          </p>
          
          {/* Verification Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Verified</span>
              {emailVerified ? (
                <span className="text-green-600 font-semibold">✓</span>
              ) : (
                <span className="text-red-600 font-semibold">✗</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Phone Verified</span>
              {phoneVerified ? (
                <span className="text-green-600 font-semibold">✓</span>
              ) : (
                <span className="text-red-600 font-semibold">✗</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Complete Verification
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;
