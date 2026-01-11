import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null); // Track which category dropdown is open
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goldSubcategories = [
    {
      name: 'All Gold',
      slug: 'all',
      icon: '✨',
      image:
        'https://images.unsplash.com/photo-1750208759824-6b7f2c3ee420?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fGFsbCUyMGdvbGQlMjBqZXdlbGxlcnklMjBwaG90b3xlbnwwfDB8MHx8fDA%3D',
    },
    {
      name: 'Gold Earrings',
      slug: 'earrings',
      icon: '👂',
      image:
        'https://pcchandraindia.com/cdn/shop/files/22KDIJVTR1376_1_1.webp?v=1736938404',
    },
    {
      name: 'Gold Rings',
      slug: 'rings',
      icon: '💍',
      image:
        'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw3d46a4e7/images/hi-res/510689FHAAA00_2.jpg?sw=640&sh=640',
    },
    {
      name: 'Gold Nose Pins',
      slug: 'nose-pins',
      icon: '🔸',
      image:
        'https://t4.ftcdn.net/jpg/16/27/34/79/360_F_1627347932_hW3pMjo9tlPqKzXTxdBaj9inc5bo2gzA.jpg',
    },
    {
      name: 'Gold Bangles',
      slug: 'bangles',
      icon: '⭕',
      image:
        'https://pcchandraindia.com/cdn/shop/files/22KGHTK50173_0.webp?v=1742548170',
    },
    {
      name: 'Gold Chains',
      slug: 'chains',
      icon: '⛓️',
      image:
        'https://cdn.caratlane.com/media/catalog/product/U/U/UU01826-YG0000_1_lar.jpg',
    },
    {
      name: 'Gold Engagement Rings',
      slug: 'engagement-rings',
      icon: '💎',
      image:
        'https://cdn.shopify.com/s/files/1/0039/6994/1568/files/Copy_of_9707_9679-53.jpg?v=1687248664',
    },
    {
      name: 'Gold Kadas',
      slug: 'kadas',
      icon: '🪔',
      image:
        'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/792/1657886924_794527ebed1c6e21285b.jpg',
    },
    {
      name: 'Gold Bracelets',
      slug: 'bracelets',
      icon: '🧿',
      image:
        'https://www.tanishq.co.in/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwe5601166/images/hi-res/51D1SCBCQAA00_1.jpg',
    },
    {
      name: 'Gold Pendants',
      slug: 'pendants',
      icon: '💠',
      image:
        'https://www.gehnaindia.com/_next/image?url=https%3A%2F%2Fcdn-assets.gehnaindia.com%2Fxjji0lqzm8c7yrpbg3eh0i4fqlin&w=3840&q=75',
    },
    {
      name: 'Gold Necklaces',
      slug: 'necklaces',
      icon: '📿',
      image:
        'https://newswarntaraash.in/blog/wp-content/uploads/2024/06/NST-GN-002-e1719488387357.webp',
    },
    {
      name: 'Gold Mangalsutras',
      slug: 'mangalsutra',
      icon: '🪬',
      image:
        'https://www.kushals.com/cdn/shop/files/antique-mangalsutra-ruby-gold-16-inch-antique-mangalsutra-181052-1173905986.jpg?v=1750234743',
    },
  ];
  const silverSubcategories = [
    { name: 'All Silver', slug: 'all', icon: '✨', image: 'https://img.tatacliq.com/images/i20//437Wx649H/MP000000023870295_437Wx649H_202409271644031.jpeg' },
    { name: 'Rings', slug: 'rings', icon: '💍', image: 'https://tuanz.in/cdn/shop/files/DSC07628_1200x1200.jpg?v=1708947879' },
    { name: 'Earrings', slug: 'earrings', icon: '👂', image: 'https://lh6.googleusercontent.com/proxy/qbj7LjjPxDtpkjzGeB9yyXySr_u8T4a3OsIp9diML4LIUckCLEpcsVJA0i1VqKkArsCmeZAtqdRs6KNDtdeuTL8mnnnDNt3oqqeHw51vRasuMZH494Z67iraVmzJAQIoWhUJ9mEFjH0DQBijw8ivwHgWu3dY2apIFM8vh-Xj5t1s' },
    { name: 'Necklaces', slug: 'necklaces', icon: '📿', image: 'https://silverlinings.in/cdn/shop/products/Odissi_Necklace_OD068.jpg?v=1757269637&width=1445' },
    { name: 'Pendants', slug: 'pendants', icon: '💠', image: 'https://edgeofember.com/cdn/shop/files/Radiant-Pearl-Locket-Necklace-Silver.jpg?v=1721640631&width=1445' },
    { name: 'Bracelets', slug: 'bracelets', icon: '🔗', image: 'https://amalfa.in/cdn/shop/files/Silver_Diamond_bracelet.jpg?v=1760613931' },
    { name: 'Bangles', slug: 'bangles', icon: '⭕', image: 'https://www.zavya.co/cdn/shop/products/DSC_5298.jpg?v=1761813011' },
    { name: 'Anklets', slug: 'anklets', icon: '👣', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8uSbNc6MSh4Xd5gVtqOF8Qsq1rhBvJEEacA&s' },
    { name: 'Chains', slug: 'chains', icon: '⛓️', image: 'https://nitra.in/cdn/shop/files/20250716165841232_7085610d.jpg?v=1752923666&width=1946' },
    { name: 'Nose Pins', slug: 'nose-pins', icon: '🔸', image: 'https://karizmajewels.in/cdn/shop/files/nosestud092.jpg?v=1717658431&width=1445' },
    { name: 'Toe Rings', slug: 'toe-rings', icon: '🦶', image: 'https://img.tatacliq.com/images/i4/437Wx649H/MP000000004652762_437Wx649H_20190619232019.jpeg' },
    { name: 'Mangalsutra', slug: 'mangalsutra', icon: '🪬', image: 'https://www.giva.co/cdn/shop/files/PD0672_1.jpg?v=1694084201' },
    { name: 'Sets (Necklace Sets)', slug: 'sets', icon: '🎀', image: 'https://m.media-amazon.com/images/I/81BQN0Wjo9L._AC_UY1100_.jpg' },
  ];
  const diamondSubcategories = [
    { name: 'All Diamond', slug: 'all', icon: '✨', image: 'https://d322s37z6qhrgo.cloudfront.net/wp-content/uploads/2024/09/WPE1109-frontYG-scaled-1.jpg' },
    { name: 'Diamond Earrings', slug: 'earrings', icon: '👂', image: 'https://d322s37z6qhrgo.cloudfront.net/wp-content/uploads/2023/12/WER0140-2.jpg' },
      { name: 'Diamond Necklace Set', slug: 'sets', icon: '🎀', image: 'https://i.pinimg.com/originals/55/0d/79/550d7988903bbf6f742bdeac7cebc0fd.png' },
    { name: 'Diamond Pendants', slug: 'pendants', icon: '💠', image: 'https://www.kalyanjewellers.net/images/Jewellery/Pendant/images/Rini-Laya-Diamond-Pendant.jpg' },
    { name: 'Diamond Bangles', slug: 'bangles', icon: '⭕', image: 'https://www.satgurusparkles.com/cdn/shop/products/HVBL10853_1200x1200.jpg?v=1601915587' },
    { name: 'Diamond Rings', slug: 'rings', icon: '💍', image: 'https://jewelrydesigns.com/wp-content/uploads/ER1-Shop-Diamond-Engagement-Rings-1080X1080.jpg' },
    { name: 'Diamond Necklaces', slug: 'necklaces', icon: '📿', image: 'https://cdn.orra.co.in/media/catalog/product/cache/10238651d5f95594b9023f998383bb67/o/s/osn23038_2_1.jpg' },
    { name: 'Diamond Bracelets', slug: 'bracelets', icon: '🔗', image: 'https://withclarity.in/cdn/shop/files/BF1552880-ROSE-FRONTVIEW4.jpg?v=1737627096' },
    { name: 'Diamond Mangalsutra', slug: 'mangalsutra', icon: '🪬', image: 'https://d322s37z6qhrgo.cloudfront.net/wp-content/uploads/2024/09/WPE1109-frontYG-scaled-1.jpg' },
    { name: 'Diamond Nose Pins', slug: 'nose-pins', icon: '🔸', image: 'https://d322s37z6qhrgo.cloudfront.net/wp-content/uploads/2024/02/WNP0184-1-600x600.jpg' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };
    
    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    window.addEventListener('wishlist-updated', updateWishlistCount);
    
    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      window.removeEventListener('wishlist-updated', updateWishlistCount);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`bg-secondary text-textPrimary transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''} sticky top-0 z-50`}>
      {/* Main Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 py-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-wide text-[#c9b896]" style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>Glimmr</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-6 xl:space-x-8 flex-1 justify-center">
            <Link to="/products" className="hover:text-primary transition-colors flex flex-col items-center gap-1">
              <img 
                src="https://cdn-icons-png.freepik.com/512/1106/1106724.png?uid=R162432181" 
                alt="All Jewellery"
                className="w-7 h-7 object-contain" 
                style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
              />
              <span className="text-xs sm:text-sm">All Jewellery</span>
            </Link>
            {/* Collections dropdown removed as requested */}
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/13026/13026424.png?uid=R162432181" 
                  alt="Gold"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                />
                <span className="text-xs sm:text-sm">Gold</span>
              </span>
              <div className="absolute left-0 mt-2 w-[40rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {goldSubcategories.map((item) => (
                    <Link key={item.name} to={`/category/gold/${item.slug}`} className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-full object-cover shadow-sm border border-amber-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-sm border border-amber-100 text-lg">
                          {item.icon}
                        </span>
                      )}
                      <span className="text-sm text-textPrimary whitespace-normal">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/5789/5789394.png" 
                  alt="Silver"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                />
                <span className="text-xs sm:text-sm">Silver</span>
              </span>
              <div className="absolute left-0 mt-2 w-[40rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {silverSubcategories.map((item) => (
                    <Link key={item.name} to={`/category/silver/${item.slug}`} className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-full object-cover shadow-sm border border-slate-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700 shadow-sm border border-slate-100 text-lg">
                          {item.icon}
                        </span>
                      )}
                      <span className="text-sm text-textPrimary">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/9468/9468167.png?uid=R162432181" 
                  alt="Diamond"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                />
                <span className="text-xs sm:text-sm">Diamond</span>
              </span>
              <div className="absolute left-0 mt-2 w-[40rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {diamondSubcategories.map((item) => (
                    <Link key={item.name} to={`/category/diamond/${item.slug}`} className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 object-cover rounded-full shadow-sm border border-slate-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700 shadow-sm border border-slate-100 text-lg">
                          {item.icon}
                        </span>
                      )}
                      <span className="text-sm text-textPrimary">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/2793/2793481.png?uid=R162432181" 
                  alt="Earrings"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                />
                <span className="text-xs sm:text-sm">Earrings</span>
              </span>
              <div className="absolute left-0 mt-2 w-[30rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Studs', slug: 'studs', image: 'https://www.candere.com/media/jewellery/images/C022366_1.jpeg' },
                    { name: 'Drops', slug: 'drops', image: 'https://media.istockphoto.com/id/1193457834/photo/gold-earrings-isolated.jpg?s=612x612&w=0&k=20&c=pX_yS_13RZ_RVVzM5qn61VpgsV2zyanheF7zWifR1iQ=' },
                    { name: 'Hoops', slug: 'hoops', image: 'https://as2.ftcdn.net/jpg/06/09/80/01/1000_F_609800123_DNVFeEuUumbHKzx5nMUMRnUc78mtyNkl.jpg' },
                  ].map((item) => (
                    <Link key={item.name} to={`/products?category=earrings&subcategory=${item.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-full object-cover shadow-sm border border-amber-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-sm border border-amber-100 text-lg">👂</span>
                      )}
                      <span className="text-sm text-textPrimary">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/16961/16961825.png" 
                  alt="Necklaces"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                />
                <span className="text-xs sm:text-sm">Necklaces</span>
              </span>
              <div className="absolute left-0 mt-2 w-[30rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Chains', slug: 'chains', image: 'https://carltonlondon.co.in/cdn/shop/files/fjn4936_4.jpg?v=1756967793&width=1500' },
                    { name: 'Pendants', slug: 'pendants', image: 'https://www.candere.com/media/jewellery/images/C021994___1.jpeg' },
                    { name: 'Chokers', slug: 'chokers', image: 'https://aspfashionjewellery.com/cdn/shop/files/gold-forming-choker-with-earrings-white-background.png?v=1764591308&width=3840' },
                  ].map((item) => (
                    <Link key={item.name} to={`/products?category=necklaces&subcategory=${item.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-full object-cover shadow-sm border border-amber-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-sm border border-amber-100 text-lg">📿</span>
                      )}
                      <span className="text-sm text-textPrimary">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/1940/1940886.png?uid=R162432181" 
                  alt="Rings"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                />
                <span className="text-xs sm:text-sm">Rings</span>
              </span>
              <div className="absolute left-0 mt-2 w-[30rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Engagement', slug: 'engagement', image: 'https://www.siriusjewels.com/uploads/products/copy_1DS-46.74.jpg' },
                    { name: 'Daily Wear', slug: 'daily-wear', image: 'https://kinclimg0.bluestone.com/f_jpg,c_scale,w_828,q_80,b_rgb:f0f0f0/giproduct/BISM0011R02_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-25698.png' },
                    { name: 'Couple Rings', slug: 'couple-rings', image: 'https://www.tanishq.co.in/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw05455b17/images/hi-res/50E4SRFBA2137_1.jpg' },
                  ].map((item) => (
                    <Link key={item.name} to={`/products?category=rings&subcategory=${item.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-full object-cover shadow-sm border border-amber-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-sm border border-amber-100 text-lg">💍</span>
                      )}
                      <span className="text-sm text-textPrimary">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors flex flex-col items-center gap-1">
                <img 
                  src="https://cdn-icons-png.freepik.com/512/12741/12741542.png?uid=R162432181" 
                  alt="Wedding"
                  className="w-7 h-7 object-contain" 
                  style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                />
                <span className="text-xs sm:text-sm">Wedding</span>
              </span>
              <div className="absolute left-0 mt-2 w-[30rem] bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/40 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Bridal Sets', slug: 'bridal-sets', image: 'https://medias.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/t/stone-studded-bridal-set-v1-jcv146_1.jpg' },
                    { name: 'Gift Sets', slug: 'gift-sets', image: 'https://images.laceandfavour.com/_cache/_products/1700x1700/cleo-gold-teardrop-cubic-zirconia-wedding-jewellery-set-4.jpg' },
                  ].map((item) => (
                    <Link key={item.name} to={`/products?category=wedding&subcategory=${item.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-full object-cover shadow-sm border border-amber-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-sm border border-amber-100 text-lg">💎</span>
                      )}
                      <span className="text-sm text-textPrimary">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/collections" className="hover:text-primary transition-colors flex flex-col items-center gap-1">
              <img 
                src="https://cdn-icons-png.freepik.com/512/9852/9852348.png?uid=R162432181" 
                alt="Collections"
                className="w-7 h-7 object-contain" 
                style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
              />
              <span className="text-xs sm:text-sm">Collections</span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={toggleSearch} className="hover:text-primary transition-colors p-2 -m-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {user ? (
              <div className="relative group">
                <button className="hover:text-primary transition-colors flex items-center gap-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-accent">Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-accent">Admin Panel</Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-accent"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            <Link to="/wishlist" className="hover:text-primary transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className="hover:text-primary transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13l1.1-5m8.9 5L17 8m0 0l1.1 5M9 21a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-primary text-secondary text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            </Link>
            <button onClick={toggleMobileMenu} className="md:hidden hover:text-primary transition-colors p-2 -m-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-accent max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col space-y-0">
              <Link to="/products?category=all" className="py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <img 
                  src="https://cdn-icons-png.freepik.com/512/1106/1106724.png?uid=R162432181" 
                  alt="All Jewellery"
                  className="w-6 h-6 object-contain flex-shrink-0" 
                />
                All Jewellery
              </Link>
              
              {/* Gold Dropdown */}
              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'gold' ? null : 'gold')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/13026/13026424.png?uid=R162432181" 
                      alt="Gold"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                    />
                    <span className="font-medium">Gold</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'gold' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'gold' && (
                  <div className="bg-accent/10 pl-4">
                    {goldSubcategories.map((item) => (
                      <Link
                        key={item.name}
                        to={`/category/gold/${item.slug}`}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700 text-xs flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Silver Dropdown */}
              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'silver' ? null : 'silver')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/5789/5789394.png" 
                      alt="Silver"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                    />
                    <span className="font-medium">Silver</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'silver' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'silver' && (
                  <div className="bg-accent/10 pl-4">
                    {silverSubcategories.map((item) => (
                      <Link
                        key={item.name}
                        to={`/category/silver/${item.slug}`}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-700 text-xs flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Diamond Dropdown */}
              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'diamond' ? null : 'diamond')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/9468/9468167.png?uid=R162432181" 
                      alt="Diamond"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                    />
                    <span className="font-medium">Diamond</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'diamond' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'diamond' && (
                  <div className="bg-accent/10 pl-4">
                    {diamondSubcategories.map((item) => (
                      <Link
                        key={item.name}
                        to={`/category/diamond/${item.slug}`}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 object-cover rounded-full flex-shrink-0"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-700 text-xs flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'earrings' ? null : 'earrings')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/2793/2793481.png?uid=R162432181" 
                      alt="Earrings"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                    />
                    <span className="font-medium">Earrings</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'earrings' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'earrings' && (
                  <div className="bg-accent/10 pl-4">
                    {[
                      { name: 'All Earrings', slug: '', image: 'https://www.candere.com/media/jewellery/images/C022366_1.jpeg' },
                      { name: 'Studs', slug: 'studs', image: 'https://www.candere.com/media/jewellery/images/C022366_1.jpeg' },
                      { name: 'Drops', slug: 'drops', image: 'https://media.istockphoto.com/id/1193457834/photo/gold-earrings-isolated.jpg?s=612x612&w=0&k=20&c=pX_yS_13RZ_RVVzM5qn61VpgsV2zyanheF7zWifR1iQ=' },
                      { name: 'Hoops', slug: 'hoops', image: 'https://as2.ftcdn.net/jpg/06/09/80/01/1000_F_609800123_DNVFeEuUumbHKzx5nMUMRnUc78mtyNkl.jpg' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.slug ? `/products?category=earrings&subcategory=${item.slug}` : '/products?category=earrings'}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'necklaces' ? null : 'necklaces')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/16961/16961825.png" 
                      alt="Necklaces"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                    />
                    <span className="font-medium">Necklaces</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'necklaces' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'necklaces' && (
                  <div className="bg-accent/10 pl-4">
                    {[
                      { name: 'All Necklaces', slug: '', image: 'https://carltonlondon.co.in/cdn/shop/files/fjn4936_4.jpg?v=1756967793&width=1500' },
                      { name: 'Chains', slug: 'chains', image: 'https://carltonlondon.co.in/cdn/shop/files/fjn4936_4.jpg?v=1756967793&width=1500' },
                      { name: 'Pendants', slug: 'pendants', image: 'https://www.candere.com/media/jewellery/images/C021994___1.jpeg' },
                      { name: 'Chokers', slug: 'chokers', image: 'https://aspfashionjewellery.com/cdn/shop/files/gold-forming-choker-with-earrings-white-background.png?v=1764591308&width=3840' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.slug ? `/products?category=necklaces&subcategory=${item.slug}` : '/products?category=necklaces'}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'rings' ? null : 'rings')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/1940/1940886.png?uid=R162432181" 
                      alt="Rings"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                    />
                    <span className="font-medium">Rings</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'rings' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'rings' && (
                  <div className="bg-accent/10 pl-4">
                    {[
                      { name: 'All Rings', slug: '', image: 'https://www.siriusjewels.com/uploads/products/copy_1DS-46.74.jpg' },
                      { name: 'Engagement', slug: 'engagement', image: 'https://www.siriusjewels.com/uploads/products/copy_1DS-46.74.jpg' },
                      { name: 'Daily Wear', slug: 'daily-wear', image: 'https://kinclimg0.bluestone.com/f_jpg,c_scale,w_828,q_80,b_rgb:f0f0f0/giproduct/BISM0011R02_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-25698.png' },
                      { name: 'Couple Rings', slug: 'couple-rings', image: 'https://www.tanishq.co.in/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw05455b17/images/hi-res/50E4SRFBA2137_1.jpg' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.slug ? `/products?category=rings&subcategory=${item.slug}` : '/products?category=rings'}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'wedding' ? null : 'wedding')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/12741/12741542.png?uid=R162432181" 
                      alt="Wedding"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                    />
                    <span className="font-medium">Wedding</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'wedding' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'wedding' && (
                  <div className="bg-accent/10 pl-4">
                    {[
                      { name: 'All Wedding', slug: '', image: 'https://medias.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/t/stone-studded-bridal-set-v1-jcv146_1.jpg' },
                      { name: 'Bridal Sets', slug: 'bridal-sets', image: 'https://medias.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/t/stone-studded-bridal-set-v1-jcv146_1.jpg' },
                      { name: 'Gift Sets', slug: 'gift-sets', image: 'https://images.laceandfavour.com/_cache/_products/1700x1700/cleo-gold-teardrop-cubic-zirconia-wedding-jewellery-set-4.jpg' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.slug ? `/products?category=wedding&subcategory=${item.slug}` : '/products?category=wedding'}
                        className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-accent/20">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'collections' ? null : 'collections')}
                  className="w-full py-3 px-4 hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src="https://cdn-icons-png.freepik.com/512/9852/9852348.png?uid=R162432181" 
                      alt="Collections"
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                    />
                    <span className="font-medium">Collections</span>
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${openCategory === 'collections' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openCategory === 'collections' && (
                  <div className="bg-accent/10 pl-4">
                    <Link
                      to="/collections"
                      className="flex items-center gap-3 py-2 px-4 text-sm hover:text-primary hover:bg-accent/30 transition-colors"
                      onClick={() => { setIsMobileMenuOpen(false); setOpenCategory(null); }}
                    >
                      <img
                        src="https://cdn-icons-png.freepik.com/512/9852/9852348.png?uid=R162432181"
                        alt="All Collections"
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        style={{ filter: 'brightness(0.8) sepia(0.8) hue-rotate(-30deg) saturate(1.5)' }}
                      />
                      All Collections
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Bar Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-secondary shadow-lg border-t border-accent z-40 animate-slideDown">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jewelry, diamonds, gold..."
                  className="w-full px-4 py-3 pr-12 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={toggleSearch}
                className="px-4 py-3 text-gray-600 hover:text-primary transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
