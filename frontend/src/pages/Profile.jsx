import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import { normalizeImageUrl } from '../utils/productImages';
import {
  DiamondIcon,
  ShoppingBagIcon,
  WalletIcon,
  HeartIcon,
  StarIcon,
  UserIcon,
  MapPinIcon,
  OrderIcon,
  SettingsIcon,
  LockIcon,
  BookmarkIcon,
  MessageIcon,
  UsersIcon,
  GiftIcon,
  CreditCardIcon,
  LogoutIcon,
  RewardIcon,
  BellIcon,
  HelpCircleIcon
} from '../components/Icons';
import api from '../api';
import { getProductImage } from '../utils/productImages';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [rewards, setRewards] = useState({ points: 0, history: [] });
  const [reviews, setReviews] = useState([]);
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: ''
  });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const defaultAddressForm = {
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    isDefault: false,
    isDefaultShipping: false,
    isDefaultBilling: false
  };
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const showPopup = (type, text) => {
    if (type === 'success') {
      toastSuccess(text);
      return;
    }
    if (type === 'info') {
      toastInfo(text);
      return;
    }
    toastError(text || 'Something went wrong');
  };

  const computeLivePrice = (product) => {
    const base = Number(product?.livePrice ?? product?.price ?? product?.currentPrice ?? 0);
    const weight = Number(product?.weight) || 0;
    const goldRate = Number(product?.goldPrice) || 0;
    const fromWeight = weight && goldRate ? weight * goldRate : 0;
    return fromWeight || base || 0;
  };

  const computeOrderLiveTotal = (order) => {
    const items = order?.items || [];
    const subtotal = items.reduce((sum, item) => {
      const prod = item.product || item;
      const unit = computeLivePrice(prod) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + unit * qty;
    }, 0);
    const tax = subtotal * 0.03;
    return { subtotal, tax, total: subtotal + tax };
  };

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [profileRes, addressesRes, ordersRes, couponsRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/addresses'),
        api.get('/user/orders'),
        api.get('/user/coupons').catch(() => ({ data: { coupons: [] } }))
      ]);

      const profileData = profileRes.data || {};
      setBasicInfo({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        gender: profileData.gender || '',
        dob: profileData.dob ? profileData.dob.substring(0, 10) : ''
      });
      setProfilePhoto(profileData.profilePhoto || '');

      const loadedAddresses = addressesRes?.data?.addresses || profileData.addresses || [];
      setAddresses(loadedAddresses);
      setAddressForm((prev) => ({ ...defaultAddressForm, phone: profileData.phone || prev.phone }));
      setEditingAddress(null);
      setShowAddressForm(false);

      const loadedOrders = ordersRes?.data?.orders || [];
      setOrders(loadedOrders);
      setStats({
        totalOrders: loadedOrders.length,
        totalSpent: loadedOrders.reduce((sum, o) => {
          const subtotal = Number(o.subtotal) || 0;
          const tax = Number(o.tax) || 0;
          const total = Number(o.totalAmount) || Number(o.total) || subtotal + tax;
          return sum + total;
        }, 0),
        loyaltyPoints: profileData.loyaltyPoints || 0
      });
      setRewards((prev) => ({ points: profileData.loyaltyPoints || 0, history: prev.history || [] }));
      setCoupons(couponsRes?.data?.coupons || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const updateBasicInfo = async () => {
    // Basic validation
    if (!basicInfo.name || !basicInfo.email || !basicInfo.phone) {
      toastError('Name, email, and phone are required');
      return;
    }
    const emailOk = /.+@.+\..+/.test(basicInfo.email);
    const phoneOk = /^\+?\d{7,15}$/.test(basicInfo.phone);
    if (!emailOk) {
      toastError('Please enter a valid email');
      return;
    }
    if (!phoneOk) {
      toastError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', basicInfo.name);
      formData.append('email', basicInfo.email);
      formData.append('phone', basicInfo.phone);
      formData.append('gender', basicInfo.gender);
      formData.append('dob', basicInfo.dob);
      if (profilePhotoFile) {
        formData.append('profilePhoto', profilePhotoFile);
      }
      if (removeProfilePhoto) {
        formData.append('removeProfilePhoto', 'true');
      }
      
      await api.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toastSuccess('Profile updated successfully');
      setProfilePhotoFile(null);
      setProfilePhotoPreview('');
      setRemoveProfilePhoto(false);
      loadProfile();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemoveProfilePhoto(false);
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toastSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    // Address validation
    if (!addressForm.name || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.country) {
      toastError('Please fill all required address fields');
      return;
    }
    if (!/^\+?\d{7,15}$/.test(addressForm.phone)) {
      toastError('Please enter a valid phone number');
      return;
    }
    if (!/^\d{4,10}$/.test(addressForm.pincode)) {
      toastError('Please enter a valid pincode');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingAddress) {
        await api.put(`/user/addresses/${editingAddress._id}`, addressForm);
        toastSuccess('Address updated successfully');
      } else {
        await api.post('/user/addresses', addressForm);
        toastSuccess('Address added successfully');
      }
      loadProfile();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        ...defaultAddressForm,
        phone: basicInfo.phone || ''
      });
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const [confirmState, setConfirmState] = useState({ open: false, id: null });

  const deleteAddress = async (id) => {
    setConfirmState({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmState.id;
    setConfirmState({ open: false, id: null });
    try {
      await api.delete(`/user/addresses/${id}`);
      toastSuccess('Address deleted successfully');
      loadProfile();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleCancelDelete = () => setConfirmState({ open: false, id: null });

  const editAddress = (address) => {
    setAddressForm({ ...defaultAddressForm, ...address });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">Please log in to view your profile.</p>
          <Link to="/auth" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-hover transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-stone-100 py-8">
      
      {/* Confirm Delete Address Modal */}
      <ConfirmDialog
        open={confirmState.open}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Global toast used for feedback */}
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Premium Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-xl mb-10 border border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400/50 flex-shrink-0 bg-gradient-to-br from-amber-100 to-stone-100 flex items-center justify-center shadow-lg">
                {profilePhoto || profilePhotoPreview ? (
                  <img 
                    src={profilePhotoPreview || normalizeImageUrl(profilePhoto)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DiamondIcon size={40} className="text-amber-600" />
                )}
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-light tracking-wide mb-1">
                  {user.name}
                </h1>
                <p className="text-amber-300/90 text-lg font-light">
                  {stats.loyaltyPoints} Loyalty Points
                </p>
                <p className="text-slate-300 text-sm mt-2">Premium Member</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 font-light border border-slate-600 hover:border-slate-500"
            >
              <LogoutIcon size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Stats Cards - Elegant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: ShoppingBagIcon, label: 'Total Orders', value: stats.totalOrders, color: 'from-slate-700 to-slate-800' },
            { icon: WalletIcon, label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, color: 'from-slate-700 to-slate-800' },
            { icon: StarIcon, label: 'Loyalty Points', value: stats.loyaltyPoints, color: 'from-amber-600 to-amber-700' }
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-opacity-20 border-white text-white group`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={32} className="text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs uppercase tracking-widest text-amber-200/80">{stat.label}</span>
              </div>
              <div className="text-3xl font-light tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex overflow-x-auto scrollbar-hide px-6">
              {[
                { id: 'basic', icon: UserIcon, label: 'Profile' },
                { id: 'orders', icon: OrderIcon, label: 'Orders' },
                { id: 'addresses', icon: MapPinIcon, label: 'Addresses' },
                { id: 'reviews', icon: StarIcon, label: 'Reviews' },
                { id: 'payments', icon: CreditCardIcon, label: 'Payments' },
                { id: 'rewards', icon: RewardIcon, label: 'Rewards' },
                { id: 'referral', icon: UsersIcon, label: 'Refer & Earn' },
                { id: 'notifications', icon: MessageIcon, label: 'Notifications' },
                { id: 'password', icon: LockIcon, label: 'Security' },
                { id: 'settings', icon: SettingsIcon, label: 'Settings' },
                { id: 'support', icon: MessageIcon, label: 'Support' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-light transition-all whitespace-nowrap text-sm border-b-2 ${
                    activeTab === tab.id
                      ? 'text-slate-900 border-b-amber-500 bg-gradient-to-b from-amber-50/30 to-transparent'
                      : 'text-slate-500 border-b-transparent hover:text-slate-700 hover:bg-slate-50/30'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-10">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl text-amber-900"
              >
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50/50 border border-red-200/50 rounded-xl text-red-900"
              >
                {error}
              </motion.div>
            )}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900">Personal Information</h2>
                  <p className="text-slate-500 text-sm mt-2">Update your profile details</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-light text-slate-700 mb-3 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-slate-700 mb-3 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-slate-700 mb-3 uppercase tracking-widest">Phone Number</label>
                    <input
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-slate-700 mb-3 uppercase tracking-widest">Gender</label>
                    <select
                      value={basicInfo.gender || ''}
                      onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50/50 text-slate-900"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-light text-slate-700 mb-3 uppercase tracking-widest">Date of Birth</label>
                    <input
                      type="date"
                      value={basicInfo.dob || ''}
                      onChange={(e) => setBasicInfo({ ...basicInfo, dob: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50/50 text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-light text-slate-700 mb-4 uppercase tracking-widest">Profile Picture</label>
                    <div className="flex flex-col gap-4">
                      {((profilePhotoPreview || profilePhoto) && !removeProfilePhoto) && (
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300/50 bg-gradient-to-br from-amber-100 to-stone-50 flex-shrink-0 shadow-md">
                            <img 
                              src={profilePhotoPreview || normalizeImageUrl(profilePhoto)} 
                              alt="Profile Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <label htmlFor="photoInput" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors font-light text-sm cursor-pointer text-center border border-amber-600 hover:border-amber-700">
                              Change Photo
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setRemoveProfilePhoto(true);
                                setProfilePhotoFile(null);
                                setProfilePhotoPreview('');
                              }}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors font-light text-sm border border-red-200 hover:border-red-300"
                            >
                              Remove Photo
                            </button>
                          </div>
                        </div>
                      )}
                      {(!profilePhoto || removeProfilePhoto) && (
                        <input
                          id="photoInput"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                          className="w-full px-4 py-4 border-2 border-dashed border-amber-300/50 rounded-xl bg-amber-50/30 text-slate-900 placeholder-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-light file:bg-amber-600 file:text-white hover:file:bg-amber-700 transition-all cursor-pointer"
                        />
                      )}
                      {removeProfilePhoto && (
                        <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-xl text-red-700 text-sm font-light">
                          ⚠️ Profile photo will be removed when you click "Update Profile"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start pt-4">
                  <button
                    onClick={updateBasicInfo}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50 font-light tracking-wide shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-6">
                  <div>
                    <h2 className="text-3xl font-light tracking-wide text-slate-900">Saved Addresses</h2>
                    <p className="text-slate-500 text-sm mt-2">Manage your delivery addresses</p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg"
                  >
                    + Add Address
                  </button>
                </div>

                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-slate-50 to-slate-100/50"
                  >
                    <h3 className="text-2xl font-light tracking-wide mb-6 text-slate-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                      />
                      <div className="flex flex-col gap-3 text-slate-700 font-light">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 accent-amber-600"
                          />
                          <span>Default Address</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefaultShipping}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefaultShipping: e.target.checked })}
                            className="w-4 h-4 accent-amber-600"
                          />
                          <span>Default Shipping</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefaultBilling}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefaultBilling: e.target.checked })}
                            className="w-4 h-4 accent-amber-600"
                          />
                          <span>Default Billing</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={saveAddress}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50 font-light shadow-md hover:shadow-lg"
                      >
                        {loading ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setAddressForm({
                            ...defaultAddressForm,
                            phone: basicInfo.phone || ''
                          });
                        }}
                        className="px-6 py-3 bg-slate-200/50 hover:bg-slate-300/50 text-slate-700 rounded-xl transition-all duration-300 font-light border border-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 border-2 border-stone-200 rounded-lg cursor-pointer transition-all bg-white hover:border-amber-400 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">{address.name}</p>
                            {address.isDefault && (
                              <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded">
                                Default
                              </span>
                            )}
                            {address.isDefaultShipping && (
                              <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded">
                                Shipping
                              </span>
                            )}
                            {address.isDefaultBilling && (
                              <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded">
                                Billing
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{address.line1}</p>
                          {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
                          <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                          <p className="text-xs text-gray-500 mt-1">{address.country} • 📞 {address.phone}</p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <button
                            onClick={() => editAddress(address)}
                            className="px-4 py-2 text-amber-700 hover:text-amber-900 hover:bg-amber-50/50 rounded-lg transition-all text-sm font-light"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAddress(address._id)}
                            className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50/50 rounded-lg transition-all text-sm font-light"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Order Details Modal - render once for selected order */}
                  {orderDetailOpen && orderDetail && (() => {
                    const liveTotals = computeOrderLiveTotal(orderDetail);
                    return (
                      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl border border-slate-100 relative my-6">
                          <button className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={() => setOrderDetailOpen(false)}>✕</button>
                          <h3 className="text-2xl font-light text-slate-900 mb-2">Order #{orderDetail._id.slice(-8).toUpperCase()}</h3>
                          <p className="text-slate-600 mb-6 text-sm">Placed on {new Date(orderDetail.createdAt).toLocaleString('en-IN')}</p>
                          
                          <div className="mb-6 pb-4 border-b border-slate-200">
                            <div className={`inline-block text-xs px-4 py-2 rounded-full font-light uppercase tracking-wider ${
                              orderDetail.status === 'delivered' ? 'bg-emerald-100/50 text-emerald-800 border border-emerald-200' :
                              orderDetail.status === 'cancelled' ? 'bg-slate-100/50 text-slate-700 border border-slate-200' :
                              orderDetail.status === 'shipped' ? 'bg-blue-100/50 text-blue-800 border border-blue-200' :
                              'bg-amber-100/50 text-amber-800 border border-amber-200'
                            }`}>
                              {orderDetail.status?.toUpperCase()}
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <h4 className="text-lg font-light text-slate-900 mb-3">Order Items</h4>
                            {orderDetail.items?.map((item, idx) => {
                              const qty = Number(item.quantity) || 0;
                              const prod = item.product || {};
                              const livePrice = computeLivePrice(prod);
                              const liveLine = livePrice * qty;
                              return (
                                <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-amber-300/50 transition-all">
                                  <div className="flex gap-4 mb-3">
                                    <img src={getProductImage(prod)} alt="" className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                                    <div className="flex-1">
                                      <h5 className="text-slate-900 font-medium text-lg mb-1">{prod.name || 'Product'}</h5>
                                      {prod.material && <p className="text-slate-600 text-sm">Material: <span className="font-light">{prod.material}</span></p>}
                                      {prod.karat && <p className="text-slate-600 text-sm">Karat: <span className="font-light">{prod.karat}</span></p>}
                                      {prod.weight && <p className="text-slate-600 text-sm">Weight: <span className="font-light">{prod.weight}g</span></p>}
                                      {prod.category && <p className="text-slate-600 text-sm">Category: <span className="font-light">{prod.category}</span></p>}
                                    </div>
                                  </div>
                                  {prod.description && (
                                    <p className="text-slate-600 text-sm mb-3 p-3 bg-slate-50 rounded-lg">{prod.description}</p>
                                  )}
                                  <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                                      <div className="text-sm text-amber-800">
                                        Qty: <span className="font-medium">{qty}</span> • Live Price: <span className="font-medium">₹{livePrice.toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-amber-600 uppercase tracking-widest">Line Total</div>
                                        <div className="text-sm text-amber-900 font-medium">₹{liveLine.toLocaleString('en-IN')}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between border-t pt-4 mb-4">
                            <div className="text-slate-600">
                              Shipping Address: <span className="font-light text-slate-900">{orderDetail.shippingAddress?.line1}, {orderDetail.shippingAddress?.city}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t pt-4 mb-6">
                            <div className="text-slate-600 text-sm">Status: <span className="font-medium text-slate-900 uppercase">{orderDetail.status}</span></div>
                            <div className="text-right">
                              <div className="flex justify-end gap-6 text-sm mb-3">
                                <div>
                                  <div className="text-xs text-slate-600 uppercase tracking-widest font-light mb-1">Subtotal</div>
                                  <div className="text-slate-800">₹{liveTotals.subtotal.toLocaleString('en-IN')}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-600 uppercase tracking-widest font-light mb-1">Tax (3%)</div>
                                  <div className="text-amber-700">₹{liveTotals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                              </div>
                              <div className="border-t pt-3">
                                <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-light">Live Total (with current prices)</div>
                                <div className="text-4xl font-light text-amber-800">₹{liveTotals.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setOrderDetailOpen(false)}
                              className="flex-1 px-6 py-3 bg-slate-200/50 hover:bg-slate-300/50 text-slate-700 rounded-xl transition-all duration-300 font-light border border-slate-300"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Order Tracking Modal - render once for selected order */}
                  {orderTrackingOpen && orderDetail && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 relative">
                        <button className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={() => setOrderTrackingOpen(false)}>✕</button>
                        <h3 className="text-xl font-light text-slate-900 mb-2">Tracking</h3>
                        {orderDetail.trackingNumber && (
                          <p className="text-slate-600 text-sm mb-4">Tracking #: <span className="font-medium text-slate-900">{orderDetail.trackingNumber}</span></p>
                        )}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {['pending','confirmed','shipped','delivered'].map((s, i) => (
                            <div key={s} className={`p-3 rounded-lg text-center border ${ (orderDetail.status || '').toLowerCase() === s ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-700' }`}>
                              <div className="text-xs uppercase tracking-widest">Step {i+1}</div>
                              <div className="text-sm font-medium">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                            </div>
                          ))}
                        </div>
                        {orderDetail.estimatedDelivery && (
                          <p className="text-slate-600 text-sm mb-4">Estimated Delivery: <span className="font-medium text-slate-900">{new Date(orderDetail.estimatedDelivery).toLocaleDateString('en-IN')}</span></p>
                        )}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => setOrderTrackingOpen(false)}
                            className="flex-1 px-6 py-3 bg-slate-200/50 hover:bg-slate-300/50 text-slate-700 rounded-xl transition-all duration-300 font-light border border-slate-300"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {addresses.length === 0 && (
                    <p className="text-slate-400 text-center py-12 font-light">No addresses saved yet. Add your first address to get started.</p>
                  )}
                </div>
              </div>
            )}

            {/* Login & Security */}
            {activeTab === 'password' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <LockIcon size={28} className="text-amber-600" />
                    Security & Authentication
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Manage your password and account security</p>
                </div>
                <div className="max-w-2xl space-y-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-xl tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">🔐</span>
                      Change Password
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-light uppercase tracking-widest text-slate-700 mb-3">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-light uppercase tracking-widest text-slate-700 mb-3">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-light uppercase tracking-widest text-slate-700 mb-3">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400"
                        />
                      </div>
                      <button
                        onClick={changePassword}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50 font-light shadow-md hover:shadow-lg"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">📱</span>
                      Two-Factor Authentication
                    </h3>
                    <p className="text-slate-600 mb-6 font-light">Add an extra layer of security to your account.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">📍</span>
                      Login Activity
                    </h3>
                    <p className="text-slate-600 font-light text-sm">Last login: <span className="text-amber-700">just now</span></p>
                    <p className="text-slate-600 font-light text-sm mt-2">Device: <span className="text-amber-700">Chrome on Windows</span></p>
                  </div>
                  <div className="md:col-span-2 border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">🔗</span>
                      Connected Accounts
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-6 py-3 border border-slate-200 hover:border-amber-300 text-slate-900 rounded-xl transition-all duration-300 font-light hover:bg-slate-50">Connect Google</button>
                      <button className="px-6 py-3 border border-slate-200 hover:border-amber-300 text-slate-900 rounded-xl transition-all duration-300 font-light hover:bg-slate-50">Connect Apple</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <OrderIcon size={28} className="text-amber-600" />
                    Order History
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">View and manage your purchases</p>
                </div>
                
                {/* Order Filter */}
                <div className="flex gap-3 flex-wrap">
                  {['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-5 py-2 rounded-lg border text-sm font-light transition-all ${
                        orderStatusFilter === status
                          ? 'border-amber-400 bg-amber-50/50 text-amber-800'
                          : 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700'
                      }`}
                    >
                      {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="space-y-5">
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6 flex justify-center opacity-20">
                        <ShoppingBagIcon size={80} />
                      </div>
                      <p className="text-slate-500 mb-6 text-lg font-light">No orders yet</p>
                      <Link to="/products">
                        <button className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all">
                          Start Shopping
                        </button>
                      </Link>
                    </div>
                  ) : (
                    orders
                      .filter(o => orderStatusFilter === 'All' ? true : (o.status || '').toLowerCase() === orderStatusFilter)
                      .map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-lg hover:border-amber-300/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <div className="flex items-center gap-4 mb-3">
                              <span className="font-light text-xl text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</span>
                              <span className={`text-xs px-4 py-2 rounded-full font-light uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-emerald-100/50 text-emerald-800 border border-emerald-200' :
                                order.status === 'cancelled' ? 'bg-slate-100/50 text-slate-700 border border-slate-200' :
                                order.status === 'shipped' ? 'bg-blue-100/50 text-blue-800 border border-blue-200' :
                                'bg-amber-100/50 text-amber-800 border border-amber-200'
                              }`}>
                                {order.status?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 font-light">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1 uppercase tracking-widest font-light">Live Total (with current prices)</div>
                            <div className="text-3xl font-light text-amber-800">₹{computeOrderLiveTotal(order).total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="flex gap-3 mb-5 overflow-x-auto pb-2">
                            {order.items.slice(0, 4).map((item, idx) => (
                              <img
                                key={idx}
                                src={getProductImage(item.product)}
                                alt=""
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                              />
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-20 h-20 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200 text-sm font-light text-slate-600">
                                +{order.items.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          <button
                            className="px-4 py-2 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-light text-sm text-slate-700"
                            onClick={async () => {
                              try {
                                const { data } = await api.get(`/user/orders/${order._id}`);
                                setOrderDetail(data.order);
                                setOrderDetailOpen(true);
                              } catch (e) {
                                toastError('Failed to load order details');
                              }
                            }}
                          >
                            View Details
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-light text-sm text-slate-700"
                            onClick={async () => {
                              try {
                                await api.get(`/user/orders/${order._id}/invoice`);
                                toastSuccess('📄 Invoice downloaded');
                              } catch (e) {
                                toastError('Failed to download invoice');
                              }
                            }}
                          >
                            📥 Download Invoice
                          </button>
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              className="px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all font-light text-sm text-slate-700 flex items-center gap-2"
                              onClick={() => { setOrderDetail(order); setOrderTrackingOpen(true); }}
                            >
                              <MapPinIcon size={16} />
                              Track Order
                            </button>
                          )}

                            {/* Order Details Modal */}
                            {orderDetailOpen && orderDetail && (
                              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                                <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl border border-slate-100 relative my-6">
                                  <button className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={() => setOrderDetailOpen(false)}>✕</button>
                                  <h3 className="text-2xl font-light text-slate-900 mb-2">Order #{orderDetail._id.slice(-8).toUpperCase()}</h3>
                                  <p className="text-slate-600 mb-6 text-sm">Placed on {new Date(orderDetail.createdAt).toLocaleString('en-IN')}</p>
                                  
                                  <div className="mb-6 pb-4 border-b border-slate-200">
                                    <div className={`inline-block text-xs px-4 py-2 rounded-full font-light uppercase tracking-wider ${
                                      orderDetail.status === 'delivered' ? 'bg-emerald-100/50 text-emerald-800 border border-emerald-200' :
                                      orderDetail.status === 'cancelled' ? 'bg-slate-100/50 text-slate-700 border border-slate-200' :
                                      orderDetail.status === 'shipped' ? 'bg-blue-100/50 text-blue-800 border border-blue-200' :
                                      'bg-amber-100/50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {orderDetail.status?.toUpperCase()}
                                    </div>
                                  </div>

                                  <div className="space-y-4 mb-6">
                                    <h4 className="text-lg font-light text-slate-900 mb-3">Order Items</h4>
                                    {orderDetail.items?.map((item, idx) => {
                                      const unit = Number(item.price) || 0;
                                      const qty = Number(item.quantity) || 0;
                                      const line = unit * qty;
                                      const prod = item.product || {};
                                      const livePrice = computeLivePrice(prod);
                                      const liveLine = livePrice * qty;
                                      return (
                                        <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-amber-300/50 transition-all">
                                          <div className="flex gap-4 mb-3">
                                            <img src={getProductImage(prod)} alt="" className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                                            <div className="flex-1">
                                              <h5 className="text-slate-900 font-medium text-lg mb-1">{prod.name || 'Product'}</h5>
                                              {prod.material && <p className="text-slate-600 text-sm">Material: <span className="font-light">{prod.material}</span></p>}
                                              {prod.karat && <p className="text-slate-600 text-sm">Karat: <span className="font-light">{prod.karat}</span></p>}
                                              {prod.weight && <p className="text-slate-600 text-sm">Weight: <span className="font-light">{prod.weight}g</span></p>}
                                              {prod.category && <p className="text-slate-600 text-sm">Category: <span className="font-light">{prod.category}</span></p>}
                                            </div>
                                          </div>
                                          {prod.description && (
                                            <p className="text-slate-600 text-sm mb-3 p-3 bg-slate-50 rounded-lg">{prod.description}</p>
                                          )}
                                          <div className="space-y-2 mb-3">
                                            <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                                              <div className="text-sm text-amber-800">
                                                Qty: <span className="font-medium">{qty}</span> • Live Price: <span className="font-medium">₹{livePrice.toLocaleString('en-IN')}</span>
                                              </div>
                                              <div className="text-right">
                                                <div className="text-xs text-amber-600 uppercase tracking-widest">Line Total</div>
                                                <div className="text-sm text-amber-900 font-medium">₹{liveLine.toLocaleString('en-IN')}</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="flex items-center justify-between border-t pt-4 mb-4">
                                    <div className="text-slate-600">
                                      Shipping Address: <span className="font-light text-slate-900">{orderDetail.shippingAddress?.line1}, {orderDetail.shippingAddress?.city}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between border-t pt-4 mb-6">
                                    <div className="text-slate-600 text-sm">Status: <span className="font-medium text-slate-900 uppercase">{orderDetail.status}</span></div>
                                    <div className="text-right">
                                      <div className="flex justify-end gap-6 text-sm mb-3">
                                        <div>
                                          <div className="text-xs text-slate-600 uppercase tracking-widest font-light mb-1">Subtotal</div>
                                          <div className="text-slate-800">₹{computeOrderLiveTotal(orderDetail).subtotal.toLocaleString('en-IN')}</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-slate-600 uppercase tracking-widest font-light mb-1">Tax (3%)</div>
                                          <div className="text-amber-700">₹{computeOrderLiveTotal(orderDetail).tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        </div>
                                      </div>
                                      <div className="border-t pt-3">
                                        <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-light">Live Total (with current prices)</div>
                                        <div className="text-4xl font-light text-amber-800">₹{computeOrderLiveTotal(orderDetail).total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 pt-4">
                                    <button
                                      onClick={() => setOrderDetailOpen(false)}
                                      className="flex-1 px-6 py-3 bg-slate-200/50 hover:bg-slate-300/50 text-slate-700 rounded-xl transition-all duration-300 font-light border border-slate-300"
                                    >
                                      Back
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Order Tracking Modal */}
                            {orderTrackingOpen && orderDetail && (
                              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 relative">
                                  <button className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={() => setOrderTrackingOpen(false)}>✕</button>
                                  <h3 className="text-xl font-light text-slate-900 mb-2">Tracking</h3>
                                  {orderDetail.trackingNumber && (
                                    <p className="text-slate-600 text-sm mb-4">Tracking #: <span className="font-medium text-slate-900">{orderDetail.trackingNumber}</span></p>
                                  )}
                                  <div className="grid grid-cols-4 gap-3 mb-4">
                                    {['pending','confirmed','shipped','delivered'].map((s, i) => (
                                      <div key={s} className={`p-3 rounded-lg text-center border ${ (orderDetail.status || '').toLowerCase() === s ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-700' }`}>
                                        <div className="text-xs uppercase tracking-widest">Step {i+1}</div>
                                        <div className="text-sm font-medium">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                                      </div>
                                    ))}
                                  </div>
                                  {orderDetail.estimatedDelivery && (
                                    <p className="text-slate-600 text-sm">Estimated Delivery: <span className="font-medium text-slate-900">{new Date(orderDetail.estimatedDelivery).toLocaleDateString('en-IN')}</span></p>
                                  )}
                                </div>
                              </div>
                            )}
                          {order.status === 'delivered' && (
                            <button className="px-4 py-2 rounded-lg bg-amber-100/50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all font-light text-sm flex items-center gap-2">
                              <StarIcon size={16} />
                              Write Review
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button 
                              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all font-light text-sm"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  try {
                                    await api.put(`/user/orders/${order._id}/cancel`);
                                    toastSuccess('Order cancelled successfully');
                                    loadProfile();
                                  } catch (e) {
                                    toastError(e.response?.data?.error || 'Failed to cancel order');
                                  }
                                }
                              }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}



            {/* Payment Methods */}
            {activeTab === 'payments' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <CreditCardIcon size={28} className="text-amber-600" />
                    Payment Methods
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Manage your payment options</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">💳</span>
                      Saved Cards
                    </h3>
                    <p className="text-slate-600 mb-6 font-light">No saved cards.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                      Add Card
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">📱</span>
                      UPI IDs
                    </h3>
                    <p className="text-slate-600 mb-6 font-light">No UPI IDs added.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                      Add UPI
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm md:col-span-2">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">💰</span>
                      Wallet
                    </h3>
                    <p className="text-slate-600 mb-6 font-light">Balance: <span className="text-2xl font-light text-amber-700">₹0</span></p>
                    <div className="flex gap-3">
                      <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                        Add Payment Method
                      </button>
                      <button className="px-6 py-3 border border-slate-200 hover:border-amber-300 text-slate-900 rounded-xl transition-all duration-300 font-light hover:bg-slate-50">
                        Remove Method
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Coupons & Rewards */}
            {activeTab === 'rewards' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <GiftIcon size={28} className="text-amber-600" />
                    Coupons & Rewards
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">View your coupons, points, and cashback</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">🎟️</span>
                      Available Coupons
                    </h3>
                    {coupons.length === 0 ? (
                      <p className="text-slate-600 font-light">No coupons available.</p>
                    ) : (
                      <ul className="space-y-3">
                        {coupons.map(c => (
                          <li key={c.code} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all">
                            <div>
                              <div className="font-light text-slate-900">{c.code}</div>
                              <div className="text-xs text-slate-600 font-light">{c.description}</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 text-white font-light hover:shadow-md transition-all" onClick={() => showPopup('success', `Applied ${c.code}`)}>Apply</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">⭐</span>
                      Reward Points
                    </h3>
                    <p className="text-slate-600 font-light mb-6">You have <span className="text-3xl font-light text-amber-700">{rewards.points}</span> points.</p>
                    <div>
                      <h4 className="font-light text-sm uppercase tracking-widest text-slate-700 mb-4">History</h4>
                      {rewards.history.length === 0 ? (
                        <p className="text-slate-600 font-light">No history yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {rewards.history.map((h, idx) => (
                            <li key={idx} className="text-sm text-slate-700 font-light p-3 bg-white rounded-lg border border-slate-100">{new Date(h.date).toLocaleDateString()} • {h.type} • <span className="text-amber-600 font-light">+{h.points} points</span></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm md:col-span-2">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">💳</span>
                      Cashback History
                    </h3>
                    <p className="text-slate-600 font-light">No cashback records.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <BellIcon size={28} className="text-amber-600" />
                    Notifications
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Manage your notification preferences</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">📧</span>
                      Email/SMS Preferences
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                        <span className="text-slate-700 font-light">Email updates</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                        <span className="text-slate-700 font-light">SMS updates</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
                      </label>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">📢</span>
                      Marketing/Promotional
                    </h3>
                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                      <span className="text-slate-700 font-light">Receive promotions</span>
                      <input type="checkbox" className="w-5 h-5 accent-amber-600" />
                    </label>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">📦</span>
                      Stock Alerts
                    </h3>
                    <p className="text-slate-600 font-light">Get notified when items are back in stock.</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">🚚</span>
                      Order Updates
                    </h3>
                    <p className="text-slate-600 font-light">Receive updates on your orders.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Support & Help */}
            {activeTab === 'support' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <HelpCircleIcon size={28} className="text-amber-600" />
                    Support & Help
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Get assistance with your orders and account</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">🎫</span>
                      Raise a Ticket
                    </h3>
                    <p className="text-slate-600 font-light mb-6">Contact our support team for issues with your order.</p>
                    <button className="px-6 py-3 w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                      Create Ticket
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">💬</span>
                      Chat Support
                    </h3>
                    <p className="text-slate-600 font-light mb-6">Chat with our support team in real-time.</p>
                    <button className="px-6 py-3 w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                      Start Chat
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm md:col-span-2">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">❓</span>
                      Frequently Asked Questions
                    </h3>
                    <p className="text-slate-600 font-light">Find answers to common questions about shipping, returns, and more.</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm md:col-span-2">
                    <h3 className="font-light text-lg tracking-wide text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">🔄</span>
                      Return/Refund Requests
                    </h3>
                    <p className="text-slate-600 font-light mb-6">Process returns and refund requests from your orders.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-300 font-light shadow-md hover:shadow-lg">
                      Request Return/Refund
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews & Ratings */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <StarIcon size={28} className="text-amber-600" />
                    My Reviews & Ratings
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Share your feedback on products</p>
                </div>
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-lg border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest font-light">Your Average Rating</p>
                      <div className="flex items-center gap-3">
                        <span className="text-5xl font-light text-amber-300">4.5</span>
                        <span className="text-amber-400 text-2xl">★★★★☆</span>
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest font-light">Total Reviews</p>
                      <span className="text-5xl font-light text-amber-300">{reviews.length}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  {reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6 flex justify-center opacity-20">
                        <StarIcon size={80} />
                      </div>
                      <p className="text-slate-500 mb-6 text-lg font-light">You haven't reviewed any products yet</p>
                      <Link to="/products">
                        <button className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all">
                          Explore Products
                        </button>
                      </Link>
                    </div>
                  ) : (
                    reviews.map((review, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-5">
                          <img src={review.productImage} alt="" className="w-24 h-24 object-cover rounded-lg shadow-md" />
                          <div className="flex-1">
                            <h3 className="font-light text-lg mb-2 text-slate-900">{review.productName}</h3>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-amber-400 text-lg">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                              <span className="text-slate-500 text-sm font-light">{new Date(review.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-700 mb-4 font-light leading-relaxed">{review.comment}</p>
                            <div className="flex gap-3">
                              <button className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-slate-700 font-light">Edit</button>
                              <button className="text-sm px-4 py-2 rounded-lg border border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all text-red-600 font-light">Delete</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Refer & Earn */}
            {activeTab === 'referral' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <UsersIcon size={28} className="text-amber-600" />
                    Refer & Earn
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Invite friends and earn rewards</p>
                </div>
                <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-3xl p-10 text-white relative overflow-hidden shadow-xl border border-amber-600/50">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                  />
                  <div className="relative z-10">
                    <h3 className="text-4xl font-light mb-4 flex items-center gap-3">
                      Invite Friends & Earn Rewards!
                      <GiftIcon size={32} />
                    </h3>
                    <p className="text-amber-50 mb-8 text-lg font-light leading-relaxed">
                      Share your unique referral code and get ₹500 when your friend makes their first purchase. They get ₹500 too!
                    </p>
                    <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 border border-white/30">
                      <p className="text-amber-100 mb-3 text-sm uppercase tracking-widest font-light">Your Referral Code</p>
                      <div className="flex items-center gap-4">
                        <span className="text-4xl font-mono font-light text-white tracking-widest">{user?.referralCode || 'GLIM' + user?._id?.slice(-6).toUpperCase()}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user?.referralCode || 'GLIM' + user?._id?.slice(-6).toUpperCase());
                            toastSuccess('Referral code copied!');
                          }}
                          className="px-6 py-3 bg-white text-amber-700 rounded-xl font-light hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl"
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 text-center shadow-sm hover:shadow-md transition-all">
                    <div className="text-5xl mb-4">📤</div>
                    <h4 className="font-light text-3xl text-amber-800 mb-2">0</h4>
                    <p className="text-slate-600 font-light">Invites Sent</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 text-center shadow-sm hover:shadow-md transition-all">
                    <div className="text-5xl mb-4">✅</div>
                    <h4 className="font-light text-3xl text-emerald-600 mb-2">0</h4>
                    <p className="text-slate-600 font-light">Successful Referrals</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 text-center shadow-sm hover:shadow-md transition-all">
                    <div className="text-5xl mb-4">💰</div>
                    <h4 className="font-light text-3xl text-amber-800 mb-2">₹0</h4>
                    <p className="text-slate-600 font-light">Total Earned</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-8 text-white">
                  <h4 className="font-light text-2xl mb-6 tracking-wide flex items-center gap-2">
                    <span className="text-amber-400">✨</span>
                    How It Works
                  </h4>
                  <ol className="space-y-4">
                    {[
                      'Share your unique referral code with friends & family',
                      'They sign up and make their first purchase using your code',
                      'You both receive ₹500 in your wallet instantly!'
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-4 font-light">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-semibold">{i + 1}</span>
                        <span className="text-amber-50 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-slate-200/50 pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-slate-900 flex items-center gap-3">
                    <SettingsIcon size={28} className="text-amber-600" />
                    Account Settings
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">Manage your privacy, preferences, and data</p>
                </div>
                <div className="space-y-6">
                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-xl tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">🔒</span>
                      Privacy Settings
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                        <span className="text-slate-700 font-light">Show my profile to other users</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                        <span className="text-slate-700 font-light">Allow personalized recommendations</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                        <span className="text-slate-700 font-light">Share purchase history for better deals</span>
                        <input type="checkbox" className="w-5 h-5 accent-amber-600" />
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-xl tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">🌍</span>
                      Language & Currency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-light uppercase tracking-widest text-slate-700 mb-3">Preferred Language</label>
                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400">
                          <option>English</option>
                          <option>हिंदी (Hindi)</option>
                          <option>తెలుగు (Telugu)</option>
                          <option>தமிழ் (Tamil)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-light uppercase tracking-widest text-slate-700 mb-3">Currency</label>
                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400">
                          <option>INR (₹)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                    <h3 className="font-light text-xl tracking-wide text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-amber-600">📊</span>
                      Data Management
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-amber-300 text-left flex items-center justify-between transition-all text-slate-900 font-light">
                        <span>Download my data</span>
                        <span>📥</span>
                      </button>
                      <button className="w-full px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-amber-300 text-left flex items-center justify-between transition-all text-slate-900 font-light">
                        <span>Clear browsing history</span>
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-2xl p-8 bg-gradient-to-br from-red-50/50 to-red-50/30">
                    <h3 className="font-light text-xl tracking-wide text-red-900 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Danger Zone
                    </h3>
                    <p className="text-red-800 mb-6 text-sm font-light">Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                          toastError('Account deletion is not yet implemented');
                        }
                      }}
                      className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-light shadow-md hover:shadow-lg"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
