import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Truck, Info, ArrowLeft, Star, ShieldCheck, Store, RefreshCw } from 'lucide-react';
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
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        const variants = data.variants || data.colors || [];
        if (variants.length > 0) setSelectedVariant(variants[0]);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id]);

  useEffect(() => { setCurrentSlide(0); }, [selectedVariant]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-500">Product not found</div>;

  // --- LOGIC ---
  const variants = product.variants || product.colors || [];
  const currentStock = selectedVariant ? selectedVariant.stock : (product.totalStock || product.stock || 0);
  const isOutOfStock = currentStock <= 0;

  // Price Calculation
  const price = product.price;
  const originalPrice = product.originalPrice || (price * 1.25);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  const savings = originalPrice - price;

  // Gallery Logic
  let gallery = [];
  if (selectedVariant && selectedVariant.albumImages && selectedVariant.albumImages.length > 0) {
    gallery = [selectedVariant.imageUrl, ...selectedVariant.albumImages];
  } else {
    gallery = [selectedVariant?.imageUrl || product.imageUrl];
  }

  const getFullUrl = (path) => (!path ? "https://via.placeholder.com/600" : (path.startsWith('http') ? path : `http://localhost:8080/${path}`));

  // Accordion Component
  const AccordionItem = ({ id, icon: Icon, title, children }) => (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setActiveTab(activeTab === id ? '' : id)}
        className="w-full flex items-center justify-between py-5 text-left group hover:bg-gray-50/50 transition-colors px-2 rounded-lg -mx-2"
      >
        <div className="flex items-center gap-4 text-gray-900 font-medium">
          <div className={`p-2 rounded-full transition-colors ${activeTab === id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 group-hover:text-black'}`}>
             <Icon size={18} />
          </div>
          <span className="text-base tracking-tight">{title}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transform transition-transform duration-300 ${activeTab === id ? 'rotate-180 text-black' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${activeTab === id ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="text-sm text-gray-600 leading-relaxed pl-[3.25rem] pr-4 pb-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 cursor-pointer hover:text-black transition-colors w-fit uppercase tracking-wider" onClick={() => navigate(-1)}>
           <ArrowLeft size={14} /> Back to Shop
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-24 items-start mb-24">
          
          {/* --- LEFT: GALLERY (Col Span 7) --- */}
          <div className="lg:col-span-7 lg:sticky lg:top-32 space-y-6">
            <div className="relative aspect-[4/3] bg-[#f8f9fa] rounded-[2rem] overflow-hidden border border-gray-100 group">
              <img 
                src={getFullUrl(gallery[currentSlide])} 
                alt="Product" 
                className={`w-full h-full object-contain p-12 transition-all duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 {!isOutOfStock && <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">Save {discountPercent}%</span>}
                 {isOutOfStock && <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Sold Out</span>}
              </div>

              {/* Arrows */}
              {gallery.length > 1 && (
                <>
                  <button onClick={() => setCurrentSlide(p => p === 0 ? gallery.length -1 : p - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-xl hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"><ChevronLeft size={20}/></button>
                  <button onClick={() => setCurrentSlide(p => p === gallery.length -1 ? 0 : p + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-xl hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"><ChevronRight size={20}/></button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {gallery.map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-20 h-20 flex-shrink-0 border rounded-xl overflow-hidden bg-gray-50 transition-all ${currentSlide === idx ? 'border-black ring-1 ring-black scale-105' : 'border-gray-200 hover:border-gray-400'}`}>
                    <img src={getFullUrl(img)} className="w-full h-full object-contain p-2 mix-blend-multiply" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: INFO (Col Span 5) --- */}
          <div className="lg:col-span-5 flex flex-col pt-2">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{product.category || "Electronics"}</h2>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-8">
               <div className="flex text-yellow-400"><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor" className="text-gray-200"/></div>
               <span className="text-sm text-gray-500 font-bold underline cursor-pointer hover:text-black">128 Reviews</span>
            </div>

            {/* Price Block */}
            <div className="mb-8">
               <div className="flex items-end gap-3 mb-1">
                 <span className="text-4xl font-extrabold text-gray-900">RM{price.toLocaleString()}</span>
                 <span className="text-xl text-gray-400 line-through mb-1">RM{originalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
               </div>
               <p className="text-sm font-bold text-red-600 uppercase tracking-wide">You save RM{savings.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-8">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 block">Select Color: <span className="text-gray-500 font-normal normal-case ml-1">{selectedVariant?.colorName}</span></span>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedVariant(v)}
                      className={`w-14 h-14 rounded-full border shadow-sm transition-all relative flex items-center justify-center ${selectedVariant === v ? 'ring-2 ring-offset-4 ring-black' : 'hover:scale-110'}`}
                      style={{ backgroundColor: v.colorHex || v.colorValue || '#000' }}
                      title={v.colorName}
                    >
                        {(v.stock <= 0) && <div className="absolute inset-0 bg-white/50 w-full h-[1px] rotate-45 top-1/2"></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-10">
               {/* Qty */}
               <div className="flex items-center border border-gray-200 rounded-full h-14 bg-gray-50 px-2">
                  <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-full hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-black flex items-center justify-center"><Minus size={18}/></button>
                  <span className="w-12 text-center text-lg font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(currentStock, qty+1))} className="w-10 h-full hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-black flex items-center justify-center"><Plus size={18}/></button>
               </div>

               {/* Add To Cart */}
               <button 
                 onClick={() => addToCart({ ...product, quantity: qty, selectedVariant })}
                 disabled={isOutOfStock}
                 className={`flex-1 h-14 rounded-full font-bold text-base uppercase tracking-wide flex items-center justify-center gap-3 transition-all shadow-xl
                   ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-black text-white hover:bg-gray-800 hover:-translate-y-1 shadow-gray-900/30'}`}
               >
                 <ShoppingCart size={20} /> {isOutOfStock ? "Sold Out" : "Add to Cart"}
               </button>

               {/* Wishlist */}
               <button onClick={() => toggleWishlist(product)} className={`h-14 w-14 border rounded-full flex items-center justify-center transition-colors shadow-sm ${isInWishlist(product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black hover:bg-gray-50'}`}>
                 <Heart size={24} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
               </button>
            </div>

            {/*Content Preserved Exactly as Requested*/}
            <div className="border-t border-gray-100 pt-2">
              <AccordionItem id="info" icon={Info} title="Product Description">
                  <p className="text-gray-600 leading-7">
                    {product.description || "Designed for those who demand excellence, this product combines premium materials with cutting-edge technology to deliver an unparalleled experience."}
                  </p>
              </AccordionItem>

              <AccordionItem id="delivery" icon={Truck} title="Delivery & Shipping">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-900">Standard Delivery</span>
                      <span className="text-green-600 font-bold">3-7 Working Days</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Check your postcode at checkout for exact timelines.</p>
                  </div>
              </AccordionItem>

              <AccordionItem id="returns" icon={RotateCcw} title="Returns & Exchange">
                  <p className="mb-3">We want you to be completely satisfied with your purchase.</p>
                  <ul className="list-disc pl-5 space-y-1 marker:text-gray-400">
                    <li>Return within <strong>30 days</strong> of receiving your order.</li>
                    <li>Items must be unworn, unwashed, and in original packaging.</li>
                    <li>Visit our <a href="#" className="underline text-black">Returns Center</a> to start a return.</li>
                  </ul>
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* --- FEATURE STRIP (MOST BOTTOM) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-t border-gray-200">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-50 rounded-full"><Truck size={28} className="text-gray-900" /></div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Fast Delivery</h4>
                    <p className="text-xs text-gray-500 mt-1">Secure shipping across Malaysia.</p>
                </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-50 rounded-full"><Store size={28} className="text-gray-900" /></div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Click & Collect</h4>
                    <p className="text-xs text-gray-500 mt-1">Collect from our local stores.</p>
                </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-50 rounded-full"><RefreshCw size={28} className="text-gray-900" /></div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Easy Returns</h4>
                    <p className="text-xs text-gray-500 mt-1">30-day hassle-free returns.</p>
                </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-50 rounded-full"><ShieldCheck size={28} className="text-gray-900" /></div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">100% Authentic Product</h4>
                    <p className="text-xs text-gray-500 mt-1">Guaranteed original products.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;