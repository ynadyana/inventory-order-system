import { X, Minus, Plus, Heart, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const QuickView = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);

  const variants = product.variants || product.colors || [];

  // --- INITIALIZE VARIANT ---
  useEffect(() => {
    if (variants.length > 0) {
      // Try to find the first variant that HAS stock to be the default
      const firstInStock = variants.find(v => v.stock > 0);
      setSelectedVariant(firstInStock || variants[0]);
    }
  }, [product]);


  const currentStock = selectedVariant ? selectedVariant.stock : (product.totalStock || product.stock || 0);
  const isOutOfStock = currentStock <= 0;

  // Reset quantity if stock changes 
  useEffect(() => {
    if (qty > currentStock && currentStock > 0) {
      setQty(currentStock);
    }
  }, [currentStock, qty]);

  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

  const currentImage = hoveredImage || (selectedVariant ? selectedVariant.imageUrl : null) || product.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors z-20">
          <X size={20} />
        </button>

        {/* Left: Product Gallery */}
        <div className="w-full md:w-1/2 bg-[#f8f9fa] p-12 flex items-center justify-center relative group">
          {/* Badge showing Status */}
          {isOutOfStock ? (
             <span className="absolute top-6 left-6 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-sm rounded-sm">
               Out of Stock
             </span>
          ) : (
             <span className="absolute top-6 left-6 bg-emerald-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-sm rounded-sm">
               In Stock
             </span>
          )}
          
          <img 
            src={getFullUrl(currentImage)} 
            className={`w-full h-auto max-h-[300px] object-contain mix-blend-multiply transition-all duration-500 transform group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            alt={product.name} 
          />
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-slate-900">RM{product.price.toLocaleString()}</span>
            
            {/* HIDDEN STOCK COUNT - Just showing status */}
            {isOutOfStock ? (
                <span className="flex items-center gap-1 text-sm font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                    <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
            ) : (
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" /> In Stock
                </span>
            )}
          </div>

          {/* COLORS SECTION */}
          {variants.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                 Select Variant: <span className="text-black ml-1">{selectedVariant ? selectedVariant.colorName : 'None'}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant, index) => {
                  
                  const colorHex = typeof variant === 'string' 
                    ? variant 
                    : (variant.colorHex || variant.colorValue || '#000000');

                  const isVariantSoldOut = variant.stock <= 0;
                  const isSelected = selectedVariant === variant;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)} 
                      onMouseEnter={() => setHoveredImage(variant.imageUrl)}
                      onMouseLeave={() => setHoveredImage(null)}
                      
                      className={`w-10 h-10 rounded-full border shadow-sm transition-all duration-200 relative ${
                         isSelected 
                           ? 'ring-2 ring-offset-2 ring-gray-900 scale-110 border-transparent' 
                           : 'border-gray-200 hover:scale-110 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: colorHex }}
                      title={`${variant.colorName || 'Color'} ${isVariantSoldOut ? '(Sold Out)' : ''}`} 
                    >
                        {/* Diagonal Line for Sold Out Variants */}
                        {isVariantSoldOut && (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                                <div className="w-[120%] h-[1px] bg-red-500/80 rotate-45 transform origin-center"></div>
                            </div>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-8 border-t border-gray-100 pt-6 line-clamp-3">
            {product.description || "Experience premium quality with our latest tech collection."}
          </p>

          <div className="mt-auto space-y-6">
            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              
              <div className={`flex items-center border border-gray-200 rounded-full bg-gray-50 px-4 py-2 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-black transition"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                <button onClick={() => setQty(Math.min(currentStock, qty + 1))} className="text-gray-500 hover:text-black transition"><Plus size={16} /></button>
              </div>
              
              <button 
                disabled={isOutOfStock}
                onClick={() => { 
                    addToCart({
                        ...product, 
                        quantity: qty,
                        selectedVariant: selectedVariant // Pass selection to cart
                    }); 
                    onClose(); 
                }}
                className={`flex-1 font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-all transform shadow-lg
                    ${isOutOfStock 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                        : 'bg-slate-900 hover:bg-black text-white active:scale-95 hover:shadow-xl'
                    }`}
              >
                <ShoppingCart size={18} /> {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
              </button>
              
              <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;