import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Truck, Info, ArrowLeft, Star, ShieldCheck, Store, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('info'); 
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.variants?.length > 0) {
            // Select first stocked variant
            const stocked = data.variants.find(v => v.stock > 0);
            setSelectedVariant(stocked || data.variants[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { setCurrentSlide(0); }, [selectedVariant]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-500">Product not found</div>;

  // --- LOGIC: Grouping & Price ---
  const variants = product.variants || [];
  
  // 1. Unique Colors
  const uniqueColors = Array.from(new Map(variants.filter(v => v.colorHex).map(v => [v.colorHex, v])).values());
  
  // 2. Storages for Selected Color
  const availableStorages = variants.filter(v => selectedVariant && v.colorHex === selectedVariant.colorHex);
  
  // 3. Dynamic Price
  const currentPrice = selectedVariant?.price ? selectedVariant.price : product.price;
  
  const currentStock = selectedVariant ? selectedVariant.stock : (product.totalStock || product.stock || 0);
  const isOutOfStock = currentStock <= 0;

  // Discount Logic
  const originalPrice = product.originalPrice || (currentPrice * 1.2); // Fake MSRP logic if not provided
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const savings = originalPrice - currentPrice;

  let gallery = selectedVariant?.albumImages?.length > 0 ? [selectedVariant.imageUrl, ...selectedVariant.albumImages] : [selectedVariant?.imageUrl || product.imageUrl];
  const getFullUrl = (path) => (!path ? "https://via.placeholder.com/600" : (path.startsWith('http') ? path : `http://localhost:8080/${path}`));

  // Accordion Component
  const AccordionItem = ({ id, icon: Icon, title, children }) => (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setActiveTab(activeTab === id ? '' : id)} className="w-full flex items-center justify-between py-5 text-left group hover:bg-gray-50/50 transition-colors px-2 rounded-lg -mx-2">
        <div className="flex items-center gap-4 text-gray-900 font-medium">
          <div className={`p-2 rounded-full transition-colors ${activeTab === id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 group-hover:text-black'}`}><Icon size={18} /></div>
          <span className="text-base tracking-tight">{title}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transform transition-transform duration-300 ${activeTab === id ? 'rotate-180 text-black' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${activeTab === id ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><div className="text-sm text-gray-600 leading-relaxed pl-[3.25rem] pr-4 pb-2">{children}</div></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 cursor-pointer hover:text-black transition-colors w-fit uppercase" onClick={() => navigate(-1)}><ArrowLeft size={14} /> Back to Shop</nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-24 items-start mb-24">
          
          {/* GALLERY */}
          <div className="lg:col-span-7 lg:sticky lg:top-32 space-y-6">
            <div className="relative aspect-[4/3] bg-[#f8f9fa] rounded-[2rem] overflow-hidden border border-gray-100 group">
              <img src={getFullUrl(gallery[currentSlide])} className={`w-full h-full object-contain p-12 transition-all duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} alt="" />
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 {!isOutOfStock && <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">Save {discountPercent}%</span>}
                 {isOutOfStock && <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Sold Out</span>}
              </div>
              {gallery.length > 1 && (
                <>
                  <button onClick={() => setCurrentSlide(p => p === 0 ? gallery.length - 1 : p - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={20}/></button>
                  <button onClick={() => setCurrentSlide(p => p === gallery.length - 1 ? 0 : p + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={20}/></button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-4 overflow-x-auto justify-center">
                {gallery.map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-20 h-20 border rounded-xl overflow-hidden bg-gray-50 transition-all ${currentSlide === idx ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}>
                    <img src={getFullUrl(img)} className="w-full h-full object-contain p-2 mix-blend-multiply" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="lg:col-span-5 flex flex-col pt-2">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{product.category}</h2>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-8">
               <div className="flex text-yellow-400"><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor" className="text-gray-200"/></div>
               <span className="text-sm text-gray-500 font-bold underline cursor-pointer">128 Reviews</span>
            </div>

            {/* Price Block (FIXED) */}
            <div className="mb-8">
               <div className="flex items-end gap-3 mb-1">
                 <span className="text-4xl font-extrabold text-gray-900">RM{currentPrice.toLocaleString()}</span>
                 <span className="text-xl text-gray-400 line-through mb-1">RM{originalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
               </div>
               <p className="text-sm font-bold text-red-600 uppercase tracking-wide">You save RM{savings.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
            </div>

            {/* COLOR SELECTION */}
            {uniqueColors.length > 0 && (
              <div className="mb-8">
                <span className="text-sm font-bold text-gray-900 uppercase block mb-4">Color: <span className="text-gray-500 font-normal ml-1">{selectedVariant?.colorName}</span></span>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((v, i) => (
                    <button key={i} onClick={() => setSelectedVariant(variants.find(varnt => varnt.colorHex === v.colorHex))}
                      className={`w-14 h-14 rounded-full border shadow-sm transition-all ${selectedVariant?.colorHex === v.colorHex ? 'ring-2 ring-offset-4 ring-black' : 'hover:scale-110'}`}
                      style={{ backgroundColor: v.colorHex }} 
                      title={v.colorName} />
                  ))}
                </div>
              </div>
            )}

            {/* STORAGE SELECTION */}
            {availableStorages.length > 0 && (
              <div className="mb-10">
                <span className="text-sm font-bold text-gray-900 uppercase block mb-4">Storage:</span>
                <div className="flex flex-wrap gap-3">
                  {availableStorages.map((v, i) => (
                    <button key={i} onClick={() => setSelectedVariant(v)} disabled={v.stock <= 0}
                      className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${selectedVariant?.id === v.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-700 border-gray-200 hover:border-black'} ${v.stock <= 0 ? 'opacity-40 line-through cursor-not-allowed' : ''}`}>
                      {v.storage || "Standard"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback for Options without color */}
            {uniqueColors.length === 0 && variants.length > 1 && (
              <div className="mb-8">
                <span className="text-sm font-bold text-gray-900 uppercase block mb-4">Select Option:</span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button key={i} onClick={() => setSelectedVariant(v)} disabled={v.stock <= 0}
                      className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${selectedVariant?.id === v.id ? 'bg-black text-white' : 'bg-white text-gray-700 border-gray-200 hover:border-black'}`}>
                      {v.storage || v.colorName || `Option ${i+1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-10">
               <div className="flex items-center border border-gray-200 rounded-full h-14 bg-gray-50 px-2">
                  <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-full flex items-center justify-center"><Minus size={18}/></button>
                  <span className="w-12 text-center text-lg font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(currentStock, qty+1))} className="w-10 h-full flex items-center justify-center"><Plus size={18}/></button>
               </div>
               <button onClick={() => addToCart({...product, quantity: qty, selectedVariant})} disabled={isOutOfStock}
                 className={`flex-1 h-14 rounded-full font-bold uppercase tracking-wide flex items-center justify-center gap-3 transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400' : 'bg-black text-white hover:bg-gray-800'}`}>
                 <ShoppingCart size={20} /> {isOutOfStock ? "Sold Out" : "Add to Cart"}
               </button>
               <button onClick={() => toggleWishlist(product)} className={`h-14 w-14 border rounded-full flex items-center justify-center transition-colors shadow-sm ${isInWishlist(product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-black'}`}>
                 <Heart size={24} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
               </button>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <AccordionItem id="info" icon={Info} title="Product Description"><p className="text-gray-600 leading-7">{product.description}</p></AccordionItem>
              <AccordionItem id="delivery" icon={Truck} title="Delivery & Shipping"><div className="space-y-3"><div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><span className="font-medium text-gray-900">Standard Delivery</span><span className="text-green-600 font-bold">3-7 Working Days</span></div></div></AccordionItem>
              <AccordionItem id="returns" icon={RotateCcw} title="Returns & Exchange"><p className="mb-3">We want you to be completely satisfied.</p></AccordionItem>
            </div>
          </div>
        </div>

        {/* Feature Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-t border-gray-200">
            <div className="flex flex-col items-center text-center gap-3"><div className="p-3 bg-gray-50 rounded-full"><Truck size={28} className="text-gray-900" /></div><div><h4 className="font-bold text-gray-900 text-sm uppercase">Fast Delivery</h4><p className="text-xs text-gray-500">Secure shipping.</p></div></div>
            <div className="flex flex-col items-center text-center gap-3"><div className="p-3 bg-gray-50 rounded-full"><Store size={28} className="text-gray-900" /></div><div><h4 className="font-bold text-gray-900 text-sm uppercase">Click & Collect</h4><p className="text-xs text-gray-500">Local pickup.</p></div></div>
            <div className="flex flex-col items-center text-center gap-3"><div className="p-3 bg-gray-50 rounded-full"><RefreshCw size={28} className="text-gray-900" /></div><div><h4 className="font-bold text-gray-900 text-sm uppercase">Easy Returns</h4><p className="text-xs text-gray-500">30-day policy.</p></div></div>
            <div className="flex flex-col items-center text-center gap-3"><div className="p-3 bg-gray-50 rounded-full"><ShieldCheck size={28} className="text-gray-900" /></div><div><h4 className="font-bold text-gray-900 text-sm uppercase">Authentic</h4><p className="text-xs text-gray-500">100% Original.</p></div></div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;