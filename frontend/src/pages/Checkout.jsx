import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { INDIAN_STATES, fetchAddressFromPincode, isValidPincode } from '../utils/addressUtils';
import { INDIAN_CITIES } from '../utils/indianCities';
import { getProductImage } from '../utils/productImages';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment
  const { user, loading: authLoading } = useAuth();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true); // Checkbox to save new address
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card, upi

  useEffect(() => {
    // Wait for auth to load before checking user
    if (authLoading) {
      return;
    }
    
    if (!user) {
      toastError('Please log in to checkout');
      navigate('/auth');
      return;
    }
    // Fetch cart
    api.get(`/cart/${user.id || user._id}`).then(res => setCart(res.data));
    
    // Fetch saved addresses
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      console.log('[FETCH ADDRESSES] Fetching saved addresses...');
      const res = await api.get('/user/addresses');
      console.log('[FETCH ADDRESSES] Response:', res.data);
      
      const { addresses: list = [], defaultShippingAddressId } = res.data || {};
      console.log('[FETCH ADDRESSES] Addresses count:', list.length);
      
      setSavedAddresses(list);
      
      // Prefer backend-provided defaultShippingAddressId, then isDefault, else first
      if (list.length > 0) {
        const defaultById = defaultShippingAddressId
          ? list.find(a => a._id === defaultShippingAddressId)
          : null;
        const defaultAddr = defaultById || list.find(a => a.isDefault) || list[0];
        if (defaultAddr) {
          console.log('[FETCH ADDRESSES] Setting default address:', defaultAddr);
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            name: defaultAddr.name,
            phone: defaultAddr.phone,
            line1: defaultAddr.line1,
            line2: defaultAddr.line2,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
            country: defaultAddr.country || 'India'
          });
        }
      }
    } catch (err) {
      console.error('[FETCH ADDRESSES] Error:', err);
      console.error('[FETCH ADDRESSES] Response:', err.response?.data);
      // Don't show error toast for address fetch - it's optional
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const addr = savedAddresses.find(a => a._id === addressId);
    if (addr) {
      setShippingAddress({
        name: addr.name,
        phone: addr.phone || '', // Use saved phone number
        line1: addr.line1,
        line2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country,
      });
    }
    setIsAddingNew(false);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    setPincodeError('');
    
    if (name === 'city') {
      handleCitySearch(value);
    }
  };

  const handlePincodeBlur = async (e) => {
    const pincode = e.target.value;
    
    if (!pincode) {
      setPincodeError('');
      return;
    }

    if (!isValidPincode(pincode)) {
      setPincodeError('Please enter a valid 6-digit pincode');
      return;
    }

    setPincodeLoading(true);
    setPincodeError('');

    try {
      const details = await fetchAddressFromPincode(pincode);
      
      if (details) {
        setShippingAddress(prev => ({
          ...prev,
          city: details.city,
          state: details.state
        }));
        toastSuccess(`City and State auto-filled for pincode ${pincode}`);
      } else {
        setPincodeError('Pincode not found. Please enter city and state manually.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setPincodeError('Could not fetch address details. Please try again.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleCitySearch = (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setFilteredCities([]);
      setShowCityDropdown(false);
      return;
    }
    
    const filtered = INDIAN_CITIES.filter(city => 
      city.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 50); // Show max 50 results
    
    setFilteredCities(filtered);
    setShowCityDropdown(filtered.length > 0);
  };

  const handleCitySelect = (city) => {
    setShippingAddress(prev => ({ ...prev, city }));
    setFilteredCities([]);
    setShowCityDropdown(false);
  };

  const handleSaveNewAddress = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      toastError('Please fill all required fields');
      return;
    }

    try {
      if (saveAddress) {
        // Save address to user profile
        console.log('[SAVE ADDRESS] Saving address:', {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        });

        const response = await api.post('/user/addresses', {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country,
          isDefault: savedAddresses.length === 0
        });
        
        console.log('[SAVE ADDRESS] Response received:', response.data);
        
        if (response.data.addresses) {
          setSavedAddresses(response.data.addresses);
          const newAddr = response.data.addresses[response.data.addresses.length - 1];
          console.log('[SAVE ADDRESS] New address saved with ID:', newAddr._id);
          setSelectedAddressId(newAddr._id);
          toastSuccess('✅ Address saved to your profile! You can use it for future orders.');
        } else {
          console.error('[SAVE ADDRESS] No addresses in response');
          toastError('Address saved but could not update list');
        }
      } else {
        // Just use the address without saving
        toastSuccess('✅ Using address for this order');
      }
      
      setIsAddingNew(false);
      setSaveAddress(true);
    } catch (err) {
      console.error('[SAVE ADDRESS] Error:', err);
      console.error('[SAVE ADDRESS] Response:', err.response?.data);
      toastError(err.response?.data?.error || 'Failed to save address. Please try again.');
      toastError('Failed to save address');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toastError('Please log in to checkout');
      return;
    }
    
    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      toastError('Please fill all shipping details');
      return;
    }

    // Validate payment method
    if (!paymentMethod) {
      toastError('Please select a payment method');
      return;
    }
    
    setLoading(true);
    try {
      console.log('[CHECKOUT] Sending order with:', {
        userId: user.id || user._id,
        shippingAddress,
        paymentMethod
      });

      const response = await api.post('/orders', { 
        userId: user.id || user._id,
        shippingAddress,
        paymentMethod
      });

      console.log('[CHECKOUT] Order created successfully:', response.data);
      
      // Extract order data
      const orderData = response.data.order || response.data;
      
      toastSuccess('Order placed successfully! Redirecting...');
      
      // Clear cart immediately
      setCart({ items: [] });
      
      // Update cart count in CartContext
      try {
        await updateCartCount();
      } catch (e) {
        console.warn('Failed to update cart count:', e);
      }
      
      // Wait a moment for state updates, then redirect
      setTimeout(() => {
        navigate('/thank-you', { 
          state: { orderData: orderData }
        });
      }, 500);
      
    } catch (err) {
      console.error('[CHECKOUT] Checkout failed:', err);
      console.error('[CHECKOUT] Error response:', err.response?.data);
      console.error('[CHECKOUT] Full error:', err.message);
      
      // Provide specific error messages
      let errorMessage = 'Checkout failed. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid order details. Please check your cart and address.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in again to complete checkout.';
        setTimeout(() => navigate('/auth'), 2000);
      } else if (err.response?.status === 404) {
        errorMessage = 'Cart not found. Please add items and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.03); // 3% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Show loading while auth is being verified
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-semibold">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 py-12 relative overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-amber-100/20 to-stone-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 35, repeat: Infinity }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-neutral-200/20 to-zinc-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800"
          >
            Checkout
          </motion.h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-center"
        >
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: 'Review Order' },
              { num: 2, label: 'Shipping' },
              { num: 3, label: 'Payment' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ${
                    step >= s.num
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {step > s.num ? '✓' : s.num}
                  {step === s.num && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-amber-400/30 blur-md"
                    />
                  )}
                </motion.div>
                <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`mx-4 h-0.5 w-16 ${step > s.num ? 'bg-amber-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-3xl">📦</span>
                    Order Items
                  </h2>
                  <div className="space-y-4">
                    {cart.items.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Your cart is empty</p>
                        <Link to="/products">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg"
                          >
                            Continue Shopping
                          </motion.button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        {cart.items.map((item, idx) => (
                          <motion.div
                            key={item._id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 hover:shadow-md transition-shadow"
                          >
                            <img
                              src={getProductImage(item.product)}
                              alt={item.product?.name}
                              className="w-20 h-20 object-cover rounded-xl shadow-sm"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                              <p className="text-sm text-gray-600">
                                {item.product?.material}
                                {item.product?.material?.toLowerCase() === 'gold' && ` • ${item.product?.karat || 24}K`}
                                {' • '}{item.product?.weight}g
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-800">
                                ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₹{(item.product?.price || 0).toLocaleString('en-IN')} each
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setStep(2)}
                          className="w-full mt-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Continue to Shipping
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-3xl">🏠</span>
                    Shipping Address
                  </h2>

                  {/* Saved Addresses */}
                  {!isAddingNew && savedAddresses.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">💎</span>
                        Your Saved Addresses
                      </h3>
                      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                        {savedAddresses.map((addr, idx) => (
                          <motion.div
                            key={addr._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedAddressId === addr._id
                                ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md'
                                : 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-sm'
                            }`}
                            onClick={() => handleSelectAddress(addr._id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedAddressId === addr._id
                                  ? 'border-amber-600 bg-amber-600'
                                  : 'border-stone-400 bg-white'
                              }`}>
                                {selectedAddressId === addr._id && (
                                  <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-white text-sm font-bold"
                                  >
                                    ✓
                                  </motion.span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-800">{addr.name}</p>
                                  {addr.isDefault && (
                                    <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">{addr.line1}</p>
                                {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
                                <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-xs text-gray-500 mt-1">{addr.country} • 📞 {addr.phone}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAddingNew(true)}
                        className="mt-4 w-full py-3 border-2 border-dashed border-amber-600 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">➕</span>
                        Add New Address
                      </motion.button>
                    </div>
                  )}

                  {/* Add/Edit Address Form */}
                  {(isAddingNew || savedAddresses.length === 0) && (
                    <div className="bg-gradient-to-br from-amber-50/50 to-stone-50 p-8 rounded-2xl border-2 border-amber-200 mb-6">
                      <div className="flex items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <span className="text-2xl">📍</span>
                          {isAddingNew ? 'Add New Address' : 'Shipping Address'}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            name="name"
                            value={shippingAddress.name}
                            onChange={handleAddressChange}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="Your 10-digit phone number"
                            name="phone"
                            maxLength="10"
                            inputMode="numeric"
                            value={shippingAddress.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              handleAddressChange({
                                target: { name: 'phone', value }
                              });
                            }}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
                          <input
                            type="text"
                            placeholder="House No., Building Name"
                            name="line1"
                            value={shippingAddress.line1}
                            onChange={handleAddressChange}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            placeholder="Road name, Area, Colony"
                            name="line2"
                            value={shippingAddress.line2}
                            onChange={handleAddressChange}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="6-digit pincode"
                              name="pincode"
                              maxLength="6"
                              value={shippingAddress.pincode}
                              onChange={handleAddressChange}
                              onBlur={handlePincodeBlur}
                              className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all ${
                                pincodeError ? 'border-red-300' : 'border-amber-200'
                              }`}
                            />
                            {pincodeLoading && (
                              <div className="absolute right-3 top-3">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full"
                                />
                              </div>
                            )}
                          </div>
                          {pincodeError && (
                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                              <span>⚠️</span> {pincodeError}
                            </p>
                          )}
                          {!pincodeError && shippingAddress.city && (
                            <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                              <span>✓</span> Auto-filled for pincode {shippingAddress.pincode}
                            </p>
                          )}
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">City/Town *</label>
                          <input
                            type="text"
                            placeholder="Start typing city name (min 2 letters)..."
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleAddressChange}
                            onFocus={() => {
                              if (shippingAddress.city.length >= 2) {
                                handleCitySearch(shippingAddress.city);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowCityDropdown(false), 200);
                            }}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all"
                            autoComplete="off"
                          />
                          
                          {/* City Dropdown */}
                          {showCityDropdown && filteredCities.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            >
                              {filteredCities.map((city) => (
                                <div
                                  key={city}
                                  onClick={() => handleCitySelect(city)}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 text-gray-800"
                                >
                                  {city}
                                </div>
                              ))}
                              {filteredCities.length === 50 && (
                                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 text-center">
                                  Showing first 50 results. Type more to refine search.
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                          <select
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleAddressChange}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all appearance-none cursor-pointer"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23b45309' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.75rem center',
                              paddingRight: '2.5rem'
                            }}
                          >
                            <option value="">Select State/Union Territory</option>
                            {INDIAN_STATES.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                          <input
                            type="text"
                            placeholder="Country"
                            name="country"
                            value={shippingAddress.country}
                            onChange={handleAddressChange}
                            className="w-full p-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Save Address Checkbox */}
                      {(isAddingNew || savedAddresses.length === 0) && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-5 h-5 rounded border-2 border-blue-400 accent-blue-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              💾 Save address to my profile
                            </span>
                          </label>
                          <p className="text-xs text-gray-600 mt-2 ml-8">
                            Your address will be saved to your profile and you can select it for future orders
                          </p>
                        </div>
                      )}

                      {isAddingNew ? (
                        <div className="flex gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAddingNew(false)}
                            className="flex-1 py-3 border-2 border-stone-300 text-gray-700 rounded-lg font-semibold hover:bg-stone-100 transition-all"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveNewAddress}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                          >
                            <span>💾</span>
                            {saveAddress ? 'Save Address' : 'Continue'}
                          </motion.button>
                        </div>
                      ) : savedAddresses.length === 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveNewAddress}
                          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span>💾</span>
                          {saveAddress ? 'Save Address' : 'Continue'}
                        </motion.button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border-2 border-stone-300 text-gray-700 rounded-xl font-semibold hover:bg-stone-50 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg"
                    >
                      Continue to Payment
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-3xl">💳</span>
                    Payment Method
                  </h2>
                  <div className="space-y-4">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                      { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                      { id: 'upi', label: 'UPI Payment', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' }
                    ].map((pm) => (
                      <motion.div
                        key={pm.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === pm.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{pm.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{pm.label}</p>
                            <p className="text-sm text-gray-600">{pm.desc}</p>
                          </div>
                          {paymentMethod === pm.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm"
                            >
                              ✓
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border-2 border-stone-300 text-gray-700 rounded-xl font-semibold hover:bg-stone-50 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      )}
                      {loading ? 'Processing Order...' : `Place Order • ₹${calculateTotal().toLocaleString('en-IN')}`}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-stone-200 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 3%)</span>
                  <span className="font-semibold">₹{calculateTax().toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-stone-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-stone-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">🔒</span>
                  <span>Secure 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">✓</span>
                  <span>100% Certified Jewelry</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">↩️</span>
                  <span>Easy 30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">📞</span>
                  <span>24/7 Customer support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

