import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { ShoppingCart, Heart, User, ChevronDown, Package, Layers, MapPin, Gamepad2, Laptop } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect } from 'react';
import api from '../lib/axios';

const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Brands
  const brands = ["Logitech", "Asus", "Sony", "Apple", "Nvidia", "Dell", "Razer", "Samsung"];

  // --- HIDE NAVBAR LOGIC ---
  if (location.pathname === '/login' || location.pathname === '/register') {
      return null;
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch(e) {}
    }
    
    api.get('/products/categories')
        .then(res => {
             const uniqueCats = Array.from(new Set(res.data));
             setCategories(uniqueCats);
        })
        .catch(err => {
            console.error("Failed to load categories", err);
            setCategories(["Laptops", "Audio", "Accessories", "Monitors"]);
        });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const navigateToFilter = (type, value) => {
      navigate(`/products?${type}=${encodeURIComponent(value)}`);
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-40 font-sans border-b border-slate-100">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* 1. LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-8">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">TechVault</span>
        </Link>

        {/* 2. CENTER: MAIN NAVIGATION */}
        <div className="hidden lg:flex items-center gap-1">
            
            {/* SHOP Dropdown */}
            <div className="relative group px-4 py-2 cursor-pointer rounded-lg hover:bg-slate-50 transition-all duration-200">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-blue-600 uppercase tracking-wide">
                    <Laptop className="w-4 h-4" /> Shop <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </span>
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-4 py-2">Categories</p>
                    {categories.length > 0 ? categories.map((cat, idx) => (
                        <button key={idx} onClick={() => navigateToFilter('category', cat)} className="block w-full text-left px-4 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg capitalize text-sm font-medium transition flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {cat}
                        </button>
                    )) : <div className="px-4 py-2 text-xs text-slate-400">Loading...</div>}
                </div>
            </div>

            {/* BRANDS Dropdown */}
            <div className="relative group px-4 py-2 cursor-pointer rounded-lg hover:bg-slate-50 transition-all duration-200">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-blue-600 uppercase tracking-wide">
                    <Layers className="w-4 h-4" /> Brands <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </span>
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-4 py-2">Popular Brands</p>
                    {brands.map((brand, idx) => (
                        <button key={idx} onClick={() => navigateToFilter('brand', brand)} className="block w-full text-left px-4 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-sm font-medium transition flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {brand}
                        </button>
                    ))}
                </div>
            </div>

            <button className="px-4 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 uppercase tracking-wide">
                <MapPin className="w-4 h-4" /> Locations
            </button>

        </div>

        {/* 3. RIGHT: ICONS */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <button onClick={() => setIsWishlistOpen(true)} className="relative group p-2 rounded-full hover:bg-slate-50 transition">
            <Heart className="w-6 h-6 text-slate-600 group-hover:text-red-500 transition" />
            {wishlist.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{wishlist.length}</span>}
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="relative group p-2 rounded-full hover:bg-slate-50 transition">
            <ShoppingCart className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition" />
            {cart.length > 0 && <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          {user ? (
            <div className="relative group cursor-pointer">
               <div className="flex items-center gap-3 pl-2">
                  <div className="text-right hidden md:block">
                      <p className="text-xs font-bold text-slate-900 leading-none">{user.username}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">Member</p>
                  </div>
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 shadow-sm transition group-hover:scale-105">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
               </div>
               <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 md:hidden">
                      <p className="text-sm font-bold text-slate-900">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link to="/orders" className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2"><Package className="w-4 h-4" /> My Orders</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition flex items-center gap-2"><span className="w-4 h-4">➜</span> Logout</button>
               </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition bg-slate-100 px-4 py-2 rounded-lg hover:bg-blue-50">
              <User className="w-4 h-4" /> <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;