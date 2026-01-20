import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView'; 
import { Loader, ShieldCheck, Award, ArrowRight, Truck, Zap } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); 

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setProducts(data);
      })
      .catch(err => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, []);

  const brands = [
    { name: "Logitech", logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg" },
    { name: "Asus", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg" },
    { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Nvidia", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" },
  ];

  if (loading) return <div className="flex justify-center items-center h-96"><Loader className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="space-y-16 pb-20">

      {/* --- 1. HERO BANNER --- */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl min-h-[400px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        
        <div className="relative z-10 px-8 md:px-16 max-w-2xl text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3" /> New Arrivals</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Level Up Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Tech Arsenal</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Discover the latest gaming gear, high-performance laptops, and premium accessories. Official warranty included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 text-center">
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* --- 2. TRUST BADGES (Service Highlights) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition cursor-default">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck className="w-8 h-8" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">100% Authentic</h3><p className="text-sm text-slate-500">Guaranteed original products.</p></div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition cursor-default">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Award className="w-8 h-8" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">Official Warranty</h3><p className="text-sm text-slate-500">Local manufacturer support.</p></div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition cursor-default">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Truck className="w-8 h-8" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">Fast Delivery</h3><p className="text-sm text-slate-500">Secure shipping across Malaysia.</p></div>
        </div>
      </div>

      {/* --- 3. FEATURED BRANDS --- */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Brands</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {brands.map((brand, idx) => (
            <div key={idx} className="group h-24 flex items-center justify-center p-6 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="max-h-8 w-auto object-contain opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. LATEST PRODUCTS --- */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <div>
             <h2 className="text-2xl font-bold text-slate-900">Latest Drops</h2>
             <p className="text-slate-500 text-sm mt-1">Freshly stocked tech just for you.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            Shop All Products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onQuickView={() => setSelectedProduct(p)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
             <p className="text-slate-400">No products found.</p>
          </div>
        )}
      </div>

       {/* Quick View Modal */}
       {selectedProduct && (
          <QuickView 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
       )}
    </div>
  );
};

export default Home;