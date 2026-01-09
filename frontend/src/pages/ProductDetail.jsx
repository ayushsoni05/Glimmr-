import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { HeartIcon } from '../components/Icons';
import api from '../api';
import { getProductImage, getProductImages } from '../utils/productImages';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const { success: toastSuccess, error: toastError } = useToast();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist')) || []);
  const [perGramRates, setPerGramRates] = useState({ gold: 6500, silver: 80 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
    
    // Fetch live prices
    api.get('/prices/latest')
      .then(res => {
        if (res.data.gold?.price) setPerGramRates(prev => ({ ...prev, gold: res.data.gold.price }));
        if (res.data.silver?.price) setPerGramRates(prev => ({ ...prev, silver: res.data.silver.price }));
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id, product?._id]);

  const addToCart = async () => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      await api.post('/cart', { userId: user.id || user._id, productId: id, quantity: 1 });
      updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const toggleWishlist = () => {
    let updatedWishlist;
    if (wishlist.includes(id)) {
      updatedWishlist = wishlist.filter(itemId => itemId !== id);
    } else {
      updatedWishlist = [...wishlist, id];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  if (!product) return <div className="container mx-auto p-4">Loading...</div>;

  const images = getProductImages(product);
  const prevImage = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);

  const isDiamondProduct = ((product.material || '').toLowerCase() === 'diamond') || product.diamond?.hasDiamond;

  const calculateDisplayPrice = () => {
    const breakdownPrice = product.priceBreakdown?.finalPrice;
    if (isDiamondProduct) {
      // For diamond items, use configured pricing only (no live metal rate shown)
      if (breakdownPrice) return Math.round(breakdownPrice);
      if (product.price) return Math.round(product.price);
      return null;
    }

    if (breakdownPrice) return Math.round(breakdownPrice);

    const isGold = (product.material || '').toLowerCase() === 'gold';
    const isSilver = (product.material || '').toLowerCase() === 'silver';
    const perGram = isSilver ? perGramRates.silver : perGramRates.gold;
    if (!perGram || !product.weight) return product.price;

    const weight = Number(product.weight) || 0;
    const karat = Number(product.karat || 24);
    const purity = isGold ? (karat / 24) : 1.0;
    return Math.round(perGram * weight * purity);
  };

  const displayPrice = calculateDisplayPrice();

  const formatMoney = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  };

  const diamondDetails = isDiamondProduct ? product.priceBreakdown?.diamondDetails : null;
  const diamondInfo = isDiamondProduct ? {
    carat: product.diamond?.carat,
    cut: product.diamond?.cut,
    color: product.diamond?.color,
    clarity: product.diamond?.clarity,
    baseRatePerCarat: diamondDetails?.baseRatePerCarat,
    cutMultiplier: diamondDetails?.cutMultiplier,
    colorMultiplier: diamondDetails?.colorMultiplier,
    clarityMultiplier: diamondDetails?.clarityMultiplier,
    calculatedCost: diamondDetails?.withMultipliers,
  } : null;

  const breakdown = product.priceBreakdown || null;
  const breakdownHasValues = !!breakdown && [
    breakdown.metalCost,
    breakdown.diamondCost,
    breakdown.makingCharges,
    breakdown.gst,
    breakdown.finalPrice,
  ].some((v) => Number(v) > 0);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full">
          <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden shadow-lg">
            <img
              src={images[activeIndex] || getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full w-10 h-10 flex items-center justify-center shadow"
                >
                  ‹
                </button>
                <button
                  aria-label="Next image"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full w-10 h-10 flex items-center justify-center shadow"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 transition ${
                    idx === activeIndex ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-primary mb-2">{product.name}</h1>
          <p className="text-lg text-textPrimary mb-6">{product.description}</p>
          
          {/* Product Specifications */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Product Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Material</p>
                <p className="text-lg font-bold text-textPrimary capitalize">{product.material}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-lg font-bold text-textPrimary">{product.weight}g</p>
              </div>
              {product.material?.toLowerCase() === 'gold' && (
                <div>
                  <p className="text-sm text-gray-600">Karat</p>
                  <p className="text-lg font-bold text-textPrimary">{product.karat || 24}K</p>
                </div>
              )}
              {product.category && (
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-lg font-bold text-textPrimary capitalize">{product.category}</p>
                </div>
              )}
            </div>
          </div>

          {/* Diamond Info */}
          {diamondInfo && (
            <div className="mb-6 p-4 bg-white border border-amber-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-amber-900">Diamond Details</h3>
                {diamondInfo.baseRatePerCarat && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                    Base: {formatMoney(diamondInfo.baseRatePerCarat)}/ct
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                  <p className="text-gray-500">Carat</p>
                  <p className="font-bold">{diamondInfo.carat || '—'} ct</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                  <p className="text-gray-500">Cut</p>
                  <p className="font-bold capitalize">{diamondInfo.cut?.replace('-', ' ') || '—'}</p>
                  {diamondInfo.cutMultiplier && (
                    <p className="text-xs text-amber-800">× {diamondInfo.cutMultiplier}</p>
                  )}
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                  <p className="text-gray-500">Color</p>
                  <p className="font-bold">{diamondInfo.color || '—'}</p>
                  {diamondInfo.colorMultiplier && (
                    <p className="text-xs text-amber-800">× {diamondInfo.colorMultiplier}</p>
                  )}
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                  <p className="text-gray-500">Clarity</p>
                  <p className="font-bold">{diamondInfo.clarity || '—'}</p>
                  {diamondInfo.clarityMultiplier && (
                    <p className="text-xs text-amber-800">× {diamondInfo.clarityMultiplier}</p>
                  )}
                </div>
              </div>
              {diamondInfo.calculatedCost && (
                <div className="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-md p-3">
                  Estimated diamond cost: <span className="font-semibold">{formatMoney(diamondInfo.calculatedCost)}</span>
                </div>
              )}
            </div>
          )}

          {/* Price Section */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-amber-700">
              {isDiamondProduct ? 'Price' : 'Live Price'}: {displayPrice ? `₹${displayPrice.toLocaleString('en-IN')}` : 'Pricing pending'}
            </p>
            {isDiamondProduct ? (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800">
                <span>Configured diamond pricing (base rate + multipliers)</span>
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <span className="text-xs text-green-700 font-medium">● LIVE MARKET RATE</span>
                {product.priceBreakdown?.finalPrice && <span className="text-xs text-green-700">(includes diamond multipliers)</span>}
              </div>
            )}
            {!isDiamondProduct && product.material?.toLowerCase() === 'gold' && (
              <p className="text-sm text-gray-600 mt-3">
                Based on current gold rate of ₹{perGramRates.gold.toLocaleString('en-IN')}/gram at {product.karat || 24}K purity
              </p>
            )}
            {diamondDetails && (
              <p className="text-sm text-gray-600 mt-1">
                Diamond priced with {diamondDetails.carat || '—'}ct × cut/color/clarity multipliers
              </p>
            )}
          </div>

          {isDiamondProduct && (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-amber-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">Diamond Specifications</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500">Carat</p>
                    <p className="font-bold">{product.diamond.carat || '—'} ct</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cut</p>
                    <p className="font-bold capitalize">{product.diamond.cut?.replace('-', ' ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="font-bold">{product.diamond.color || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Clarity</p>
                    <p className="font-bold">{product.diamond.clarity || '—'}</p>
                  </div>
                </div>
                {diamondDetails && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900">
                    <p className="font-semibold mb-2">Multipliers applied</p>
                    <div className="grid grid-cols-2 gap-2">
                      <span>Cut × {diamondDetails.cutMultiplier}</span>
                      <span>Color × {diamondDetails.colorMultiplier}</span>
                      <span>Clarity × {diamondDetails.clarityMultiplier}</span>
                      <span>Base rate: {formatMoney(diamondDetails.baseRatePerCarat)} /ct</span>
                    </div>
                  </div>
                )}
              </div>

              {product.priceBreakdown && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Price Breakdown</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    {product.priceBreakdown.metalCost !== undefined && (
                      <div className="flex justify-between">
                        <span>Metal cost</span>
                        <span className="font-semibold">{formatMoney(product.priceBreakdown.metalCost)}</span>
                      </div>
                    )}
                    {product.priceBreakdown.diamondCost !== undefined && (
                      <div className="flex justify-between">
                        <span>Diamond cost</span>
                        <span className="font-semibold">{formatMoney(product.priceBreakdown.diamondCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Making charges</span>
                      <span className="font-semibold">{formatMoney(product.priceBreakdown.makingCharges)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST</span>
                      <span className="font-semibold">{formatMoney(product.priceBreakdown.gst)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-amber-800">
                      <span>Total</span>
                      <span>{formatMoney(product.priceBreakdown.finalPrice)}</span>
                    </div>
                  </div>
                  {diamondDetails && (
                    <div className="mt-3 text-xs text-slate-500">
                      Calculated using live diamond pricing with carat × multipliers.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button onClick={addToCart} className="bg-primary text-secondary px-6 py-3 rounded-lg hover:bg-accent transition-colors shadow-lg">Add to Cart</button>
            <button onClick={toggleWishlist} className={`px-6 py-3 rounded-lg transition-colors shadow-lg flex items-center gap-2 ${wishlist.includes(id) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <HeartIcon size={20} className={wishlist.includes(id) ? 'fill-white' : ''} />
              <span>{wishlist.includes(id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
