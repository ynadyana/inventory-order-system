import { X, Minus, Plus, Heart, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const QuickView = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);

  const variants = product.variants || product.colors || [];
  // --- LOGIC: DETERMINE STOCK ---
  // If a color is selected, use that color's stock. Otherwise, use total product stock.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors z-20">
          <X size={20} />
        </button>

        {/* Left: Product Gallery */}
        <div className="w-full md:w-1/2 bg-[#f8f9fa] p-12 flex items-center justify-center relative group">
          {/* Tag showing Status */}
          {isOutOfStock && (
             <span className="absolute top-6 left-6 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
               {selectedVariant ? `${selectedVariant.colorName} Sold Out` : "Sold Out"}
             </span>
          )} 
          <img 
            src={getFullUrl(currentImage)} 
            className={`w-full h-auto object-contain mix-blend-multiply transition-all duration-500 transform group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            alt={product.name} 
          />
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl font-bold text-cyan-600">RM{product.price.toLocaleString()}</span>
            {/* Dynamic Stock Text */}
            <span className={`text-sm font-bold px-2 py-1 rounded ${currentStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {currentStock > 0 ? `${currentStock} in stock` : 'Out of Stock'}
            </span>
          </div>

          {/* COLORS SECTION */}
          {variants.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                 Select Variant {selectedVariant && `- ${selectedVariant.colorName}`}
              </span>
              <div className="flex gap-3">
                {variants.map((variant, index) => {
                  
                  const colorHex = typeof variant === 'string' 
                    ? variant 
                    : (variant.colorHex || variant.colorValue || '#000000');

                  // 1. Check stock
                  const isVariantSoldOut = variant.stock !== undefined && variant.stock <= 0;

                  const isSelected = selectedVariant === variant;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)} 
                      onMouseEnter={() => setHoveredImage(variant.imageUrl)}
                      onMouseLeave={() => setHoveredImage(null)}
                      
                      className={`w-8 h-8 rounded-full border shadow-sm transition-all duration-200 ${
                         isSelected 
                           ? 'ring-2 ring-offset-2 ring-gray-900 scale-110 border-transparent' 
                           : 'border-gray-200 hover:scale-110 hover:border-gray-400'
                      }`}
                      style={{ 
                        backgroundColor: colorHex,
                        // 2. Diagonal line for out of stock
                        backgroundImage: isVariantSoldOut 
                          ? 'linear-gradient(to top right, transparent 48%, red 48%, red 52%, transparent 52%)' 
                          : 'none',
                        opacity: isVariantSoldOut ? 0.5 : 1
                      }}
                      title={`${variant.colorName || 'Color'} (${variant.stock} left)`} 
                    />
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-8 border-t border-gray-100 pt-6">
            {product.description || "Premium high-performance tech gear."}
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
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                        : 'bg-gray-900 hover:bg-black text-white active:scale-95'
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