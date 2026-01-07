import { useState, useEffect } from 'react';
import api from '../api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import apiClient from '../api';
import { useToast } from '../contexts/ToastContext';
import { HeartIcon } from '../components/Icons';
import { getProductImage } from '../utils/productImages';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist')) || []);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const [perGramGold, setPerGramGold] = useState(null);
  const [perGramSilver, setPerGramSilver] = useState(null);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = {};
    params.forEach((value, key) => {
      initialFilters[key] = value;
    });
    setFilters(initialFilters);
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // Convert numeric filter values if present
        const params = { ...filters };
        if (params.minPrice) params.minPrice = Number(params.minPrice);
        if (params.maxPrice) params.maxPrice = Number(params.maxPrice);

        const res = await api.get('/products', { params });
        if (!cancelled) {
          setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (!cancelled) {
          setError('Failed to load products. Please try again later.');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [filters]);

  // Fetch latest per-gram for dynamic pricing (gold and silver)
  useEffect(() => {
    let cancel = false;
    async function fetchLatest() {
      try {
        const res = await apiClient.get('/prices/latest?currency=inr');
        if (!cancel) {
          setPerGramGold(res.data?.gold?.price || null);
          setPerGramSilver(res.data?.silver?.price || null);
        }
      } catch (e) {
        try {
          const res2 = await apiClient.get('/prices?currency=inr');
          if (!cancel) {
            setPerGramGold(res2.data?.gold?.price || null);
            setPerGramSilver(res2.data?.silver?.price || null);
          }
        } catch {}
      }
    }
    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);
    return () => { cancel = true; clearInterval(interval); };
  }, []);

  const handleFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const addToCart = async (productId) => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      console.log('[Products] Adding to cart, userId:', user.id || user._id, 'productId:', productId);
      await api.post('/cart', { userId: user.id || user._id, productId, quantity: 1 });
      console.log('[Products] Product added, calling updateCartCount');
      await updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const toggleWishlist = (productId) => {
    let updatedWishlist;
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
    } else {
      updatedWishlist = [...wishlist, productId];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-900 mb-3 tracking-wide">
            Our Collection
          </h1>
          <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            Discover exquisite jewelry pieces crafted with precision and elegance
          </p>
        </div>
        
        {/* Search Results Indicator */}
        {filters.search && (
          <div className="mb-6 p-4 sm:p-5 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-slate-700">
                Showing results for: <strong className="break-all text-slate-900">"{filters.search}"</strong>
              </span>
            </div>
            <button 
              onClick={() => handleFilter('search', '')} 
              className="text-amber-600 hover:text-amber-700 font-medium text-sm sm:text-base transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
        
        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            <button 
              onClick={() => handleFilter('category', '')} 
              className={`px-4 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-300 ${!filters.category ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
            >
              All Categories
            </button>
            {['Earrings', 'Necklaces', 'Rings', 'Wedding'].map((cat) => (
              <button 
                key={cat}
                onClick={() => handleFilter('category', cat.toLowerCase())} 
                className={`px-4 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-300 ${filters.category === cat.toLowerCase() ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Filters Grid */}
        <div className="bg-white rounded-lg p-5 sm:p-6 mb-8 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">Material</label>
              <select 
                onChange={(e) => handleFilter('material', e.target.value)} 
                className="w-full p-3.5 border-2 border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all appearance-none bg-no-repeat bg-right pr-10 cursor-pointer hover:border-slate-400"
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`, backgroundPosition: `right 10px center`}}
              >
                <option value="">All Materials</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="diamond">Diamond</option>
                <option value="platinum">Platinum</option>
                <option value="rose gold">Rose Gold</option>
                <option value="white gold">White Gold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">Min Price (₹)</label>
              <input 
                type="number" 
                placeholder="0" 
                onChange={(e) => handleFilter('minPrice', e.target.value)} 
                className="w-full p-3.5 border-2 border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all placeholder:text-slate-400 hover:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">Max Price (₹)</label>
              <input 
                type="number" 
                placeholder="∞" 
                onChange={(e) => handleFilter('maxPrice', e.target.value)} 
                className="w-full p-3.5 border-2 border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all placeholder:text-slate-400 hover:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">Sort By</label>
              <select 
                onChange={(e) => handleFilter('sort', e.target.value)} 
                className="w-full p-3.5 border-2 border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all appearance-none bg-no-repeat bg-right pr-10 cursor-pointer hover:border-slate-400"
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`, backgroundPosition: `right 10px center`}}
              >
                <option value="">Featured</option>
                <option value="price">Price: Low to High</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 text-lg">Loading precious pieces...</p>
            </div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-600 text-lg">No products found for the selected filters.</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {products.map(product => (
              <Link to={`/products/${product._id}`} key={product._id} className="block group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full border border-slate-200 hover:border-amber-200">
                  {/* Image Container */}
                  <div className="relative bg-gradient-to-b from-slate-100 to-slate-50 overflow-hidden h-48 sm:h-56">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-grow">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h2>
                    
                    {/* Material & Weight */}
                    {(() => {
                      const isDiamond = (product.material || '').toLowerCase() === 'diamond' || product.diamond?.hasDiamond;
                      if (isDiamond) {
                        return (
                          <p className="text-xs sm:text-sm text-slate-500 mb-2 capitalize">
                            Diamond • {product.weight}g
                          </p>
                        );
                      }
                      return (
                        <p className="text-xs sm:text-sm text-slate-500 mb-2 capitalize">
                          {product.material} {product.material?.toLowerCase() === 'gold' && `• ${product.karat || 24}K`} • {product.weight}g
                        </p>
                      );
                    })()}

                    {/* Diamond Info (diamond products only) */}
                    {(((product.material || '').toLowerCase() === 'diamond') || product.diamond?.hasDiamond) && (
                      <div className="mb-3 space-y-1">
                        <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-amber-900 font-semibold">
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                            {product.diamond?.carat || '—'}ct
                          </span>
                          {product.diamond?.cut && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full capitalize">
                              Cut: {product.diamond.cut.replace('-', ' ')}
                            </span>
                          )}
                          {product.diamond?.color && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                              Color: {product.diamond.color}
                            </span>
                          )}
                          {product.diamond?.clarity && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                              Clarity: {product.diamond.clarity}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Price */}
                    <p className="text-lg sm:text-xl font-bold text-amber-700 mb-4 tracking-wide">
                      {(() => {
                        const isDiamond = (product.material || '').toLowerCase() === 'diamond' || product.diamond?.hasDiamond;
                        if (isDiamond) {
                          // For diamond items, show stored/calculated diamond price only (no live metal rate fallback).
                          if (product.price) return `₹${Math.round(product.price).toLocaleString('en-IN')}`;
                          if (product.computedPrice) return `₹${Math.round(product.computedPrice).toLocaleString('en-IN')}`;
                          return 'Pricing pending';
                        }
                        const isGold = (product.material || '').toLowerCase() === 'gold';
                        const isSilver = (product.material || '').toLowerCase() === 'silver';
                        const perGram = isSilver ? perGramSilver : perGramGold;
                        if (!perGram || !product.weight) return product.price ? `₹${Math.round(product.price).toLocaleString('en-IN')}` : '—';
                        const karat = Number(product.karat || 24);
                        const purity = isGold ? (karat / 24) : 1.0;
                        const live = Math.round(perGram * product.weight * purity);
                        return `₹${live.toLocaleString('en-IN')}`;
                      })()}
                    </p>
                    
                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product._id);
                        }} 
                        className="flex-1 bg-amber-50 text-amber-800 px-3 py-2.5 rounded-lg text-sm sm:text-base font-medium border border-amber-200 hover:bg-amber-100 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product._id);
                        }} 
                        className={`px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center font-medium ${wishlist.includes(product._id) ? 'bg-red-500 text-white shadow-sm hover:shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'}`}
                      >
                        <HeartIcon size={18} className={wishlist.includes(product._id) ? 'fill-white' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
