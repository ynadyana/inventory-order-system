import { X, Minus, Plus, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const QuickView = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);


  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

 
  const currentImage = hoveredImage || selectedImage || product.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors z-20">
          <X size={20} />
        </button>

        {/* Left: Product Gallery */}
        <div className="w-full md:w-1/2 bg-[#f8f9fa] p-12 flex items-center justify-center relative group">
          {product.stock <= 0 && (
             <span className="absolute top-6 left-6 bg-gray-900 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">Sold Out</span>
          )} 
          <img 
            src={getFullUrl(currentImage)} 
            className="w-full h-auto object-contain mix-blend-multiply transition-all duration-500 transform group-hover:scale-105" 
            alt={product.name} 
          />
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-cyan-600">RM{product.price.toLocaleString()}</span>
            <span className="text-gray-400 line-through text-lg">RM{(product.price * 1.1).toLocaleString()}</span>
          </div>

          {/* COLORS SECTION */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Select Variant</span>
              <div className="flex gap-3">
                {product.colors.map((variant, index) => {
                  
                  // Safe Color Extraction
                  const colorHex = typeof variant === 'string' 
                    ? variant 
                    : (variant.color || variant.colorValue || variant.color_value || variant.value || variant.colorHex || '#000000');
                    
                  
                  const isSelected = selectedImage === variant.imageUrl;

                  return (
                    <button
                      key={index}
                      
                      onClick={() => setSelectedImage(variant.imageUrl)}
                      
                      // Hover
                      onMouseEnter={() => setHoveredImage(variant.imageUrl)}
                      
                     //Clear preview (falls back to selectedImage)
                      onMouseLeave={() => setHoveredImage(null)}
                      
                      className={`w-8 h-8 rounded-full border shadow-sm transition-all duration-200 ${
                         isSelected 
                           ? 'ring-2 ring-offset-2 ring-gray-900 scale-110 border-transparent' 
                           : 'border-gray-200 hover:scale-110 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: colorHex }}
                      title={`Color: ${colorHex}`} 
                    />
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-8 border-t border-gray-100 pt-6">
            {product.description || "Premium high-performance tech gear designed for professionals. Featuring the latest hardware and sleek modern design."}
          </p>

          <div className="mt-auto space-y-6">
            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-black transition"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="text-gray-500 hover:text-black transition"><Plus size={16} /></button>
              </div>
              
              <button 
                onClick={() => { addToCart({...product, quantity: qty}); onClose(); }}
                className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg"
              >
                <ShoppingCart size={18} /> ADD TO CART
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