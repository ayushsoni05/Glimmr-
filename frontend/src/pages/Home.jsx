import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { getProductImage } from '../utils/productImages';

const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Curated hero carousel images
  const heroImages = [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=2070&q=80',
    'https://images.unsplash.com/photo-1585960622850-ed33c41d6418?w=2070&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=2070&auto=format&fit=crop&q=80',
    'https://plus.unsplash.com/premium_photo-1740020242524-318435e4be6f?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fGpld2Vscnl8ZW58MHwwfDB8fHww',
    'https://images.unsplash.com/photo-1721103428250-896d83207659?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fGpld2Vscnl8ZW58MHwwfDB8fHww',
    'https://images.unsplash.com/photo-1503350659573-076be1027134?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxqZXdlbHJ5fGVufDB8MHwwfHx8MA%3D%3D',
  ];

  useEffect(() => {
    // Fetch featured products with diverse categories and materials
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/featured');
        setFeaturedProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-slide carousel every 4 seconds
  useEffect(() => {
    if (user && heroImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const collections = [
    { name: 'Wedding Collection', image: 'https://plus.unsplash.com/premium_photo-1724762183134-c17cf5f5bed2?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTIzfHx3ZWRkaW5nJTIwamV3ZWxsZXJ5fGVufDB8MHwwfHx8MA%3D%3D', link: '/products?category=wedding' },
    { name: 'Daily Wear', image: 'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGRhaWx5JTIwd2VhciUyMGpld2VsbGVyeXxlbnwwfDB8MHx8fDA%3D', link: '/products?category=daily-wear' },
    { name: 'Gold Jewellery', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29sZCUyMGpld2VsbGVyeXxlbnwwfDB8MHx8fDA%3D', link: '/products?material=gold' },
    { name: 'Diamond Specials', image: 'https://plus.unsplash.com/premium_photo-1678749105251-b15e8fd164bf?w=2070&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGRpYW1vbmQlMjBqZXdlbGxlcnl8ZW58MHwwfDB8fHww', link: '/products?material=diamond' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[65vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-accent to-secondary"
        >
          {user ? (
            // Show carousel for logged-in users
            <motion.img
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={heroImages[currentSlide]}
              alt="Featured jewelry"
              className="w-full h-full object-cover"
            />
          ) : (
            // Show default image for non-logged-in users
            <img
              src={heroImages[0]}
              alt="Elegant jewelry collection"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
        {(!user || currentSlide === 0) && (
          <div className="relative z-10 text-center text-textPrimary px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 font-heading leading-tight"
            >
              Celebrate Timeless Elegance
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8"
            >
              Discover exquisite jewelry pieces crafted with passion and precision at Glimmr.
            </motion.p>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
            >
              {!user && (
                <Link to="/auth" className="btn-primary text-base sm:text-lg md:text-xl lg:text-2xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
                  Login / Signup
                </Link>
              )}
              <Link to="/products" className="btn-secondary text-base sm:text-lg md:text-xl lg:text-2xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
                Shop Now
              </Link>
            </motion.div>
          </div>
        )}

        {/* Carousel indicators for logged-in users */}
        {user && heroImages.length > 0 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-primary w-6 sm:w-8' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Collections */}
      <section className="py-12 sm:py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 font-heading"
          >
            Featured Collections
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                whileHover={{ scale: 1.03 }}
                className="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer"
                style={{ willChange: 'transform' }}
              >
                <Link to={collection.link}>
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-secondary text-lg sm:text-xl md:text-2xl font-bold font-heading px-2 text-center">{collection.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 lg:py-20 bg-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 font-heading"
          >
            Featured Products
          </motion.h2>
          {loading ? (
            <p className="text-center text-base sm:text-lg">Loading featured products...</p>
          ) : error ? (
            <p className="text-center text-base sm:text-lg text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ y: -8 }}
                  className="bg-secondary rounded-lg shadow-lg overflow-hidden group cursor-pointer"
                  style={{ willChange: 'transform' }}
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <button className="btn-primary text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-2 font-heading truncate">{product.name}</h3>
                      
                      {/* Material & Weight Info */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <span className="font-medium capitalize">{product.material || 'Gold'}</span>
                        {product.material?.toLowerCase() === 'gold' && product.karat && (
                          <span>• {product.karat}K</span>
                        )}
                        {product.weight && (
                          <span>• {product.weight}g</span>
                        )}
                      </div>

                      {/* Live Price with Badge */}
                      <div className="flex items-center gap-2">
                        <p className="text-primary text-2xl font-bold">₹{product.price?.toLocaleString('en-IN') || '---'}</p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Market rate updated daily</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Mid-Page Promotions */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="New Arrivals"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-secondary">
                  <h3 className="text-3xl font-bold mb-4 font-heading">New Arrivals</h3>
                  <p className="mb-6">Discover the latest in exquisite jewelry</p>
                  <Link to="/products" className="btn-primary">Shop Now</Link>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Festival Specials"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-secondary">
                  <h3 className="text-3xl font-bold mb-4 font-heading">Festival Specials</h3>
                  <p className="mb-6">Celebrate with our festive collection</p>
                  <Link to="/products?category=wedding" className="btn-primary">Explore</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-4xl font-bold mb-8 font-heading">Our Story</h2>
            <p className="text-lg max-w-3xl mx-auto mb-8">
              At Glimmr, we believe that every piece of jewelry tells a story. With over decades of craftsmanship
              and a commitment to authenticity, we create timeless pieces that celebrate life's most precious moments.
              From engagement rings to wedding sets, each creation is made with the finest materials and unparalleled attention to detail.
            </p>
            <Link to="/about" className="btn-secondary">
              Learn More About Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 bg-primary text-secondary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 font-heading">Stay in the Loop</h2>
            <p className="mb-6 sm:mb-8 text-sm sm:text-base px-2">Subscribe to our newsletter for exclusive offers, new arrivals, and jewelry tips.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-0 max-w-full sm:max-w-md mx-auto px-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-4 py-3 rounded-lg sm:rounded-l-lg focus:outline-none text-textPrimary text-sm"
              />
              <button className="bg-hover text-secondary px-6 py-3 rounded-lg sm:rounded-r-lg font-semibold hover:bg-textPrimary transition-colors w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
