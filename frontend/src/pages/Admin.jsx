import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminUsers from './AdminUsers';
import DiamondPricingManager from '../components/DiamondPricingManager';
import { getProductImage } from '../utils/productImages';

const Admin = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    material: '',
    karat: 24,
    weight: '',
    images: [],
    imageUrls: [],
    imageUrlInput: '',
    diamondHasDiamond: false,
    diamondCarat: '',
    diamondCut: '',
    diamondColor: '',
    diamondClarity: '',
  });
  // Keep in sync with backend ALLOWED_CATEGORIES
  const allowedCategories = [
    'rings',
    'necklaces',
    'bracelets',
    'earrings',
    'pendants',
    'sets',
    'wedding',
    // expanded subcategories
    'nose-pins',
    'toe-rings',
    'anklets',
    'bangles',
    'chains',
    'kadas',
    'mangalsutra'
  ];
  const formatCategoryLabel = (value) => value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  // Materials list for dropdown (kept in sync with backend expectations for live pricing)
  const allowedMaterials = [
    'gold',
    'silver',
    'diamond',
    'platinum',
    'rose gold',
    'white gold'
  ];
  const formatMaterialLabel = (value) => value
    .split(/[-\s]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [perGramRates, setPerGramRates] = useState({ gold: 0, silver: 0 });
  const { error: toastError, success: toastSuccess } = useToast();

  // Fetch current gold/silver rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/prices');
        setPerGramRates({
          gold: res.data.gold?.price || 0,
          silver: res.data.silver?.price || 0
        });
      } catch (err) {
        console.error('Error fetching rates:', err);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (authLoading) return; // wait for auth context to finish validating token
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role !== 'admin') {
      // Not an admin - redirect to home
      navigate('/');
      return;
    }
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'orders') fetchOrders();
  }, [activeTab, user, authLoading, productCategoryFilter]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (productCategoryFilter) params.category = productCategoryFilter;
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const calculateLivePrice = (product) => {
    const material = String(product.material).trim().toLowerCase();
    const weight = parseFloat(product.weight) || 0;
    const karat = parseInt(product.karat) || 24;

    if (material === 'gold') {
      const purity = karat / 24;
      return Math.round(perGramRates.gold * weight * purity);
    } else if (material === 'silver') {
      return Math.round(perGramRates.silver * weight);
    }
    return product.price || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        const skip = key === 'images' || key === 'imageUrls' || key === 'imageUrlInput' || key.startsWith('diamond');
        if (skip) return;
        if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      // Diamond fields (dot-notation for backend nesting)
      const isDiamond = String(form.material).trim().toLowerCase() === 'diamond';
      const hasDiamond = isDiamond || form.diamondHasDiamond;
      formData.set('diamond.hasDiamond', hasDiamond ? 'true' : 'false');
      if (hasDiamond) {
        if (form.diamondCarat !== '') formData.set('diamond.carat', form.diamondCarat);
        if (form.diamondCut) formData.set('diamond.cut', form.diamondCut);
        if (form.diamondColor) formData.set('diamond.color', form.diamondColor);
        if (form.diamondClarity) formData.set('diamond.clarity', form.diamondClarity);
      }
      
      
       // Append multiple image files if provided
       if (form.images && form.images.length > 0) {
         Array.from(form.images).forEach(file => {
           formData.append('images', file);
         });
       }

       // Append image URLs if provided
       if (form.imageUrls && form.imageUrls.length > 0) {
         formData.append('imageUrls', JSON.stringify(form.imageUrls));
       }
      // Ensure category normalized
      if (form.category) {
        formData.set('category', form.category.trim().toLowerCase());
      }

      if (editing) {
        const res = await api.put(`/products/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.debug('[ADMIN] Updated product', res.data._id);
        toastSuccess('Product updated successfully!');
        setEditing(null);
        await fetchProducts();
      } else {
        const res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.debug('[ADMIN] Created product', res.data._id, 'category:', res.data.category);
        toastSuccess('Product created successfully!');
        // Rely on fresh fetch to avoid stale list discrepancies
        await fetchProducts();
      }
      setForm({
        name: '',
        description: '',
        category: '',
        material: '',
        karat: 24,
        weight: '',
         images: [],
        imageUrls: [],
        imageUrlInput: '',
        diamondHasDiamond: false,
        diamondCarat: '',
        diamondCut: '',
        diamondColor: '',
        diamondClarity: '',
      });
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save product';
      toastError(`Error saving product: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const editProduct = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      material: product.material,
      karat: product.karat || 24,
      weight: product.weight,
      images: [], // Don't pre-fill file input
      imageUrls: Array.isArray(product.images) ? product.images : [],
      imageUrlInput: '',
      diamondHasDiamond: product?.diamond?.hasDiamond || false,
      diamondCarat: product?.diamond?.carat ?? '',
      diamondCut: product?.diamond?.cut || '',
      diamondColor: product?.diamond?.color || '',
      diamondClarity: product?.diamond?.clarity || '',
    });
    setEditing(product._id);
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toastSuccess('Product loaded for editing');
  };

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const deleteProduct = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmProductDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      toastError('Failed to delete product');
    }
  };

  const handleCancelProductDelete = () => setConfirmDelete({ open: false, id: null });

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating user role:', err);
      toastError('Failed to update user role');
    }
  };

  // Order Management Functions
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder._id}`, { status: newStatus });
      setOrders(orders.map(o => o._id === selectedOrder._id ? res.data.order : o));
      toastSuccess('Order status updated successfully');
      closeStatusModal();
    } catch (err) {
      console.error('Error updating order status:', err);
      toastError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      category: '',
      material: '',
      karat: 24,
      weight: '',
      images: [],
      imageUrls: [],
      imageUrlInput: '',
      diamondHasDiamond: false,
      diamondCarat: '',
      diamondCut: '',
      diamondColor: '',
      diamondClarity: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <img 
                src="https://cdn-icons-png.freepik.com/512/7542/7542190.png?uid=R162432181" 
                alt="Admin" 
                className="w-7 h-7 object-contain" 
              />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600">
              Admin Panel
            </h1>
          </div>
          <p className="text-slate-600 ml-16">Manage products, users, and orders</p>
        </motion.div>

        {/* Confirm Delete Product Modal */}
        <ConfirmDialog
          open={confirmDelete.open}
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmProductDelete}
          onCancel={handleCancelProductDelete}
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl shadow-sm p-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'products' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <span className="inline-flex items-center gap-2">
              <img src="https://cdn-icons-png.freepik.com/512/17153/17153035.png?uid=R162432181" alt="Products" className="w-5 h-5" />
              <span>Products</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'users' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <span className="inline-flex items-center gap-2">
              <img src="https://cdn-icons-png.freepik.com/512/11042/11042479.png?uid=R162432181" alt="Users" className="w-5 h-5" />
              <span>Users</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'orders' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <span className="inline-flex items-center gap-2">
              <img src="https://cdn-icons-png.freepik.com/512/1008/1008010.png?uid=R162432181" alt="Orders" className="w-5 h-5" />
              <span>Orders</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('diamond-pricing')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'diamond-pricing' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v6l7 5 7-5V7l-7-5zm0 2.5L14.5 7 10 9.5 5.5 7 10 4.5z"/>
              </svg>
              <span>Diamond Pricing</span>
            </span>
          </button>
        </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Product Management</h2>
            <p className="text-slate-600">Add, edit, and manage your jewelry collection</p>
          </div>

          {/* Add/Edit Product Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="mb-12 bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <h3 className="text-2xl font-bold text-slate-800">{editing ? 'Edit Product' : 'Add New Product'}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Diamond Engagement Ring" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all">
                  <select 
                    value={form.category} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl bg-transparent focus:outline-none" 
                    required
                  >
                    <option value="">Select Category</option>
                    {allowedCategories.map(c => (
                      <option key={c} value={c}>{formatCategoryLabel(c)}</option>
                    ))}
                  </select>
                  <div className="px-4 pb-3 text-xs text-slate-500">Tip: pick a primary family, then fine-tune details in the description.</div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {allowedCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        form.category === c
                          ? 'bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {formatCategoryLabel(c)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Material</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all">
                  <select 
                    value={form.material} 
                    onChange={(e) => {
                      const nextMaterial = e.target.value;
                      const isDiamond = String(nextMaterial).trim().toLowerCase() === 'diamond';
                      setForm({
                        ...form,
                        material: nextMaterial,
                        diamondHasDiamond: isDiamond ? true : form.diamondHasDiamond,
                      });
                    }} 
                    className="w-full px-4 py-3 rounded-xl bg-transparent focus:outline-none" 
                    required
                  >
                    <option value="">Select Material</option>
                    {allowedMaterials.map(m => (
                      <option key={m} value={m}>{formatMaterialLabel(m)}</option>
                    ))}
                  </select>
                  <div className="px-4 pb-3 text-xs text-slate-500">Tip: choose material to enable live pricing for Gold/Silver.</div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {allowedMaterials.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const isDiamond = m === 'diamond';
                        setForm({
                          ...form,
                          material: m,
                          diamondHasDiamond: isDiamond ? true : form.diamondHasDiamond,
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        String(form.material).toLowerCase() === m
                          ? 'bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {formatMaterialLabel(m)}
                    </button>
                  ))}
                </div>
              </div>
              {String(form.material).trim().toLowerCase() === 'gold' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Karat</label>
                  <select 
                    value={form.karat} 
                    onChange={(e) => setForm({ ...form, karat: Number(e.target.value) })} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value={24}>24K Gold</option>
                    <option value={22}>22K Gold</option>
                    <option value={18}>18K Gold</option>
                  </select>
                </div>
              )}

              {/* Diamond-specific fields (shown when material is diamond or hasDiamond toggled) */}
              {(String(form.material).trim().toLowerCase() === 'diamond' || form.diamondHasDiamond) && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-amber-200 rounded-xl bg-amber-50/60">
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Diamond Details</p>
                      <p className="text-xs text-amber-800">Set carat, cut, color, clarity for pricing.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-amber-900 font-semibold">
                      <input
                        type="checkbox"
                        checked={form.diamondHasDiamond || String(form.material).trim().toLowerCase() === 'diamond'}
                        onChange={(e) => setForm({ ...form, diamondHasDiamond: e.target.checked })}
                        className="h-4 w-4 text-amber-600 border-amber-300 rounded"
                      />
                      Includes diamond
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-1">Carat</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 1.25"
                      value={form.diamondCarat}
                      onChange={(e) => setForm({ ...form, diamondCarat: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-1">Cut</label>
                    <select
                      value={form.diamondCut}
                      onChange={(e) => setForm({ ...form, diamondCut: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select cut</option>
                      <option value="excellent">Excellent</option>
                      <option value="very-good">Very Good</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-1">Color</label>
                    <select
                      value={form.diamondColor}
                      onChange={(e) => setForm({ ...form, diamondColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select color</option>
                      {['D','E','F','G','H','I','J','K','L','M'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-1">Clarity</label>
                    <select
                      value={form.diamondClarity}
                      onChange={(e) => setForm({ ...form, diamondClarity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select clarity</option>
                      {['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Weight (grams)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 5.5" 
                  value={form.weight} 
                  onChange={(e) => setForm({ ...form, weight: e.target.value })} 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Product Images</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={(e) => setForm({ ...form, images: e.target.files })} 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-600" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Image URLs (one per line or add individually)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={form.imageUrlInput}
                    onChange={(e) => setForm({ ...form, imageUrlInput: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = (form.imageUrlInput || '').trim();
                      if (!url) return;
                      setForm({
                        ...form,
                        imageUrls: [...form.imageUrls, url],
                        imageUrlInput: ''
                      });
                    }}
                    className="px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold shadow hover:bg-amber-700 transition"
                  >
                    + Add URL
                  </button>
                </div>
                {form.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.imageUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                        <span className="max-w-[200px] truncate" title={url}>{url}</span>
                        <button
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            imageUrls: form.imageUrls.filter((_, i) => i !== idx)
                          })}
                          className="text-amber-800 hover:text-amber-600"
                          aria-label="Remove URL"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Description</label>
              <textarea 
                placeholder="Enter detailed product description..." 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none h-32" 
                required 
              />
            </div>

            <div className="flex gap-3">
              <motion.button 
                type="submit" 
                disabled={actionLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {actionLoading ? '⏳ Saving...' : editing ? '✏️ Update Product' : '➕ Add Product'}
              </motion.button>
              {editing && (
                <motion.button 
                  type="button" 
                  onClick={cancelEdit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-400 transition-all"
                >
                  ✕ Cancel
                </motion.button>
              )}
            </div>
          </motion.form>

          {/* Products List */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">Your Products</h3>
                <p className="text-slate-600">{products.length} products in collection</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Filter by category:</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all">
                  <select 
                    value={productCategoryFilter} 
                    onChange={(e) => setProductCategoryFilter(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl bg-transparent focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {allowedCategories.map(c => (
                      <option key={c} value={c}>{formatCategoryLabel(c)}</option>
                    ))}
                  </select>
                  <div className="px-4 pb-3 text-xs text-slate-500">Tap a chip below for quick filtering.</div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setProductCategoryFilter('')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      productCategoryFilter === ''
                        ? 'bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {allowedCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setProductCategoryFilter(c)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        productCategoryFilter === c
                          ? 'bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {formatCategoryLabel(c)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-100">
                <div className="text-6xl mb-4">💎</div>
                <p className="text-slate-600 text-lg">No products yet. Add your first product above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div 
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all group ${
                      editing === product._id 
                        ? 'border-amber-500 border-2 ring-4 ring-amber-200' 
                        : 'border-slate-100 hover:shadow-2xl'
                    }`}
                  >
                    {/* Editing Badge */}
                    {editing === product._id && (
                      <div className="absolute top-2 right-2 z-20 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
                        ✏️ EDITING
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-amber-100 overflow-hidden">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h4 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold mr-2">
                          {product.category}
                        </span>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">
                          {product.material}
                        </span>
                      </p>
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-lg font-bold text-amber-700">
                            💰 ₹{calculateLivePrice(product).toLocaleString()}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-green-700 font-medium">
                            ● LIVE
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          ⚖️ {product.weight}g 
                          {String(product.material).trim().toLowerCase() === 'gold' && ` | 🏆 ${product.karat || 24}K`}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button 
                          onClick={() => editProduct(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 hover:shadow-lg transition-all border border-slate-200"
                        >
                          ✏️ Edit
                        </motion.button>
                        <motion.button 
                          onClick={() => deleteProduct(product._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 bg-rose-50 text-rose-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-100 hover:shadow-lg transition-all border border-rose-200"
                        >
                          🗑️ Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && <AdminUsers />}

      {/* Diamond Pricing Tab */}
      {activeTab === 'diamond-pricing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DiamondPricingManager />
        </motion.div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Order Management</h2>
            <p className="text-slate-600">Track and manage customer orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-100">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-slate-600 text-lg">No orders yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-amber-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Products Preview</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Amount Paid</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <motion.tr 
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-amber-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{order._id.slice(-8)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-semibold text-slate-800">{order.user?.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{order.user?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-col gap-2">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <div className="w-12 h-12 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
                                  {item.product ? (
                                    <img 
                                      src={getProductImage(item.product)} 
                                      alt={item.product?.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs">No img</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-800 truncate text-xs">{item.product?.name || 'Product'}</p>
                                  <p className="text-xs text-slate-600">{item.product?.material || ''} {item.product?.karat ? `• ${item.product.karat}K` : ''}</p>
                                  <p className="text-xs text-slate-700 font-semibold">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <p className="text-xs text-blue-600 font-semibold">+{order.items.length - 2} more item(s)</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-amber-700">₹{(order.totalAmount || order.total)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <motion.button 
                            onClick={() => viewOrderDetails(order)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 hover:shadow-lg transition-all border border-blue-200 text-xs"
                          >
                            👁️ View
                          </motion.button>
                          <motion.button 
                            onClick={() => openStatusModal(order)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg font-semibold hover:bg-amber-200 hover:shadow-lg transition-all border border-amber-200 text-xs"
                          >
                            ✓ Update
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeOrderDetails}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-800">Order Details</h2>
              <motion.button
                onClick={closeOrderDetails}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-3xl text-slate-500 hover:text-slate-700 transition-colors"
              >
                ✕
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Order Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Order ID</p>
                  <p className="text-lg font-mono text-slate-800">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Customer</p>
                  <p className="text-lg font-semibold text-slate-800">{selectedOrder.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Order Date</p>
                  <p className="text-lg font-semibold text-slate-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Item Header with Image */}
                      <div className="flex gap-4 p-4 bg-white">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.product ? (
                            <img 
                              src={getProductImage(item.product)} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src="https://via.placeholder.com/100?text=No+Image" 
                              alt="No image"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-lg">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-slate-600 mt-1">{item.product?.description || ''}</p>
                          
                          {/* Product Specs */}
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            {item.product?.material && (
                              <div>
                                <span className="text-slate-500">Material:</span>
                                <span className="ml-1 font-semibold text-slate-800 capitalize">{item.product.material}</span>
                              </div>
                            )}
                            {item.product?.karat && (
                              <div>
                                <span className="text-slate-500">Karat:</span>
                                <span className="ml-1 font-semibold text-slate-800">{item.product.karat}K</span>
                              </div>
                            )}
                            {item.product?.weight && (
                              <div>
                                <span className="text-slate-500">Weight:</span>
                                <span className="ml-1 font-semibold text-slate-800">{item.product.weight}g</span>
                              </div>
                            )}
                            {item.product?.category && (
                              <div>
                                <span className="text-slate-500">Category:</span>
                                <span className="ml-1 font-semibold text-slate-800 capitalize">{item.product.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Item Pricing */}
                      <div className="bg-amber-50 border-t border-slate-200 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Quantity</p>
                            <p className="text-lg font-bold text-slate-800">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Price per Unit</p>
                            <p className="text-lg font-bold text-slate-800">₹{(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Subtotal</p>
                          <p className="text-xl font-bold text-amber-700">₹{((item.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border-2 border-amber-200">
                <h3 className="font-bold text-slate-800 mb-4 text-lg">💰 Payment Breakdown</h3>
                <div className="space-y-3">
                  {/* Item-wise breakdown */}
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    {selectedOrder.items?.map((item, idx) => {
                      const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
                      return (
                        <div key={idx} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                          <span className="text-slate-700">{item.product?.name || 'Item'} <span className="text-slate-500">({item.quantity} × ₹{(Number(item.price) || 0).toLocaleString('en-IN')})</span></span>
                          <span className="font-semibold text-slate-800">₹{itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Display actual amount paid from database */}
                  {(() => {
                    // Calculate subtotal from items (these are now live prices from backend)
                    const subtotal = selectedOrder.items?.reduce((sum, item) => {
                      return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
                    }, 0) || 0;
                    
                    // Tax amount (3% calculated from subtotal)
                    const taxAmount = subtotal * 0.03;
                    
                    // Total with tax (subtotal + tax = actual amount paid)
                    const totalWithTax = subtotal + taxAmount;
                    
                    // Use the database totalAmount if it exists, otherwise calculate
                    const amountPaid = Number(selectedOrder.totalAmount) || totalWithTax;
                    
                    return (
                      <div className="border-t-2 border-amber-300 pt-4 mt-4 space-y-2">
                        <div className="flex justify-between text-base">
                          <span className="text-slate-700">Subtotal (Items):</span>
                          <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="flex justify-between text-base">
                          <span className="text-slate-700">Tax (3%):</span>
                          <span className="font-semibold text-slate-800">+ ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="flex justify-between text-xl font-bold bg-amber-100 rounded-lg p-4 border-3 border-amber-400">
                          <span className="text-slate-800">💵 Total Amount Paid:</span>
                          <span className="text-amber-900">₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-amber-200 text-xs text-slate-600 space-y-1">
                          <p>📅 Paid on: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                          {selectedOrder.paymentIntentId && (
                            <p>💳 Payment Method: Card Payment</p>
                          )}
                          {!selectedOrder.paymentIntentId && (
                            <p>💰 Payment Method: Cash on Delivery</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Customer Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Shipping Address</h3>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-800">{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && <p className="text-slate-600">{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p className="text-slate-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeStatusModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Update Order Status</h2>
            <p className="text-slate-600 mb-6">Order ID: {selectedOrder._id.slice(-8)}</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
              >
                <option value="pending">🟡 Pending</option>
                <option value="processing">🟣 Processing</option>
                <option value="shipped">🔵 Shipped</option>
                <option value="delivered">🟢 Delivered</option>
                <option value="cancelled">🔴 Cancelled</option>
              </select>
            </div>

            <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Current Status: <span className="font-semibold text-slate-800">{selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}</span>
            </p>

            <div className="flex gap-3">
              <motion.button
                onClick={updateOrderStatus}
                disabled={actionLoading || newStatus === selectedOrder.status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? '⏳ Updating...' : '✓ Update Status'}
              </motion.button>
              <motion.button
                onClick={closeStatusModal}
                disabled={actionLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-slate-300 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-400 transition-all disabled:opacity-50"
              >
                ✕ Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Admin;
