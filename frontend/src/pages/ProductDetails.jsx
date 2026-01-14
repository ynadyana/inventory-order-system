import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Truck, Info, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('info'); 
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        const variants = data.variants || data.colors || [];
        // Default to first variant
        if (variants.length > 0) setSelectedVariant(variants[0]);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id]);

  // 2. Reset Carousel when Color Changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedVariant]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div><div className="h-4 w-32 bg-gray-200 rounded"></div></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  // --- LOGIC HELPERS ---
  const variants = product.variants || product.colors || [];
  const currentStock = selectedVariant ? selectedVariant.stock : (product.totalStock || product.stock || 0);
  const isOutOfStock = currentStock <= 0;

  // --- GALLERY LOGIC ---
  let gallery = [];
  if (selectedVariant && selectedVariant.albumImages && selectedVariant.albumImages.length > 0) {
    gallery = [selectedVariant.imageUrl, ...selectedVariant.albumImages];
  } else {
    gallery = [selectedVariant?.imageUrl || product.imageUrl];
  }

  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  // --- COMPONENT: ACCORDION ITEM ---
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
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 hover:text-black transition-colors w-fit cursor-pointer" onClick={() => navigate(-1)}>
           <ArrowLeft size={16} />
           <span className="font-medium">Back to Shop</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
          
          {/* --- LEFT: GALLERY (Sticky) --- */}
          <div className="lg:sticky lg:top-32 space-y-6">
            <div 
              className="relative aspect-[4/5] bg-[#F5F5F7] rounded-[2rem] overflow-hidden group cursor-crosshair"
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
            >
              
              {/* Main Image with transition */}
              <div className="w-full h-full flex items-center justify-center p-8">
                 <img 
                  key={currentSlide} 
                  src={getFullUrl(gallery[currentSlide])} 
                  alt="Product View" 
                  className={`w-full h-full object-contain mix-blend-multiply transition-all duration-500 animate-in fade-in zoom-in-95 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                />
              </div>

              {/* Status Badge */}
              {isOutOfStock && (
                <div className="absolute top-6 left-6 bg-black/5 backdrop-blur-md border border-white/20 text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                  Sold Out
                </div>
              )}
               {!isOutOfStock && currentStock < 5 && (
                <div className="absolute top-6 left-6 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                  Only {currentStock} left
                </div>
              )}

              {/* Navigation Arrows */}
              {gallery.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform ${isHoveringImage ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform ${isHoveringImage ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Clickable Dots / Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex justify-center gap-3">
                {gallery.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-black' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: PRODUCT INFO --- */}
          <div className="flex flex-col pt-2">
            
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 pb-8">
               <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{product.category}</h2>
               <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">{product.name}</h1>
               <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">RM{product.price.toLocaleString()}</span>
                  <span className="text-lg text-gray-400 line-through font-medium">RM{(product.price * 1.2).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
               </div>
            </div>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="mb-10">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 block">
                  Select Color: <span className="text-gray-500 font-normal normal-case ml-1">{selectedVariant?.colorName}</span>
                </span>
                
                <div className="flex flex-wrap gap-4">
                  {variants.map((variant, index) => {
                    const isVariantSoldOut = (variant.stock || 0) <= 0;
                    const isSelected = selectedVariant === variant;
                    const colorHex = typeof variant === 'string' ? variant : (variant.colorHex || variant.colorValue || '#000000');

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        className={`
                          group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                          ${isSelected ? 'ring-2 ring-offset-4 ring-black' : 'hover:scale-110'}
                        `}
                      >
                         {/* The Color Circle */}
                         <div 
                            className="w-full h-full rounded-full border border-gray-200 shadow-sm"
                            style={{ 
                              backgroundColor: colorHex,
                              backgroundImage: isVariantSoldOut ? `linear-gradient(to top right, transparent 48%, #ef4444 48%, #ef4444 52%, transparent 52%)` : 'none',
                            }}
                         />
                         
                         {/* Tooltip on Hover */}
                         <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {variant.colorName} {isVariantSoldOut ? '(Sold Out)' : ''}
                         </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <div className={`flex items-center border border-gray-200 rounded-full bg-gray-50 px-6 h-14 w-fit ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-200 rounded-full transition"><Minus size={18}/></button>
                <span className="w-12 text-center font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(Math.min(currentStock, qty + 1))} className="p-2 hover:bg-gray-200 rounded-full transition"><Plus size={18}/></button>
              </div>

              <button 
                onClick={() => addToCart({ ...product, quantity: qty, selectedVariant })}
                disabled={isOutOfStock}
                className={`flex-1 h-14 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95
                  ${isOutOfStock 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800 shadow-xl hover:shadow-2xl'}`}
              >
                {isOutOfStock ? "Sold Out" : "Add to Cart"} 
                {!isOutOfStock && <ShoppingCart size={20} />}
              </button>

              <button 
                onClick={() => toggleWishlist(product)}
                className={`h-14 w-14 border rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90
                ${isInWishlist(product.id) 
                 ? 'bg-red-50 border-red-200 text-red-500'
                 : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-red-500' 
                }`}
                >
                    <Heart 
                        size={24} 
                        fill={isInWishlist(product.id) ? "currentColor" : "none"} 
                    />
                </button>
            </div>

            {/* Accordion Info */}
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
      </div>
    </div>
  );
};

export default ProductDetails;