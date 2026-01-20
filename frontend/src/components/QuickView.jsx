import { X, Minus, Plus, Heart, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const QuickView = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);

  const variants = product.variants || [];

  // --- 1. GROUPING LOGIC ---
  // Get unique colors to display as circles 
  const uniqueColors = Array.from(new Map(variants.filter(v => v.colorHex).map(v => [v.colorHex, v])).values());
  
  // Get available storages for the CURRENTLY selected color
  const availableStorages = variants.filter(v => 
    selectedVariant && v.colorHex === selectedVariant.colorHex
  );

  // --- 2. INITIALIZATION ---
  useEffect(() => {
    if (variants.length > 0) {
      // Auto-select the first variant that has stock
      const firstInStock = variants.find(v => v.stock > 0);
      setSelectedVariant(firstInStock || variants[0]);
    }
  }, [product]);

  // --- 3. DYNAMIC CALCULATIONS ---
  const currentStock = selectedVariant ? selectedVariant.stock : (product.totalStock || product.stock || 0);
  const isOutOfStock = currentStock <= 0;
  
  // Use variant price if available, otherwise use product base price
  const currentPrice = selectedVariant?.price ? selectedVariant.price : product.price;

  useEffect(() => {
    if (qty > currentStock && currentStock > 0) setQty(currentStock);
  }, [currentStock, qty]);

  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

  const currentImage = hoveredImage || (selectedVariant ? selectedVariant.imageUrl : null) || product.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors z-20">
          <X size={20} />
        </button>

        {/* LEFT: IMAGE */}
        <div className="w-full md:w-1/2 bg-[#f8f9fa] p-12 flex items-center justify-center relative group">
          <span className={`absolute top-6 left-6 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-sm rounded-sm ${isOutOfStock ? 'bg-red-600' : 'bg-emerald-600'}`}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
          <img 
            src={getFullUrl(currentImage)} 
            className={`w-full h-auto max-h-[300px] object-contain mix-blend-multiply transition-all duration-500 transform group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} 
            alt={product.name} 
          />
        </div>

        {/* RIGHT: DETAILS */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">{product.name}</h2>
          
          {/* PRICE DISPLAY (UPDATED) */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-slate-900">RM{currentPrice.toLocaleString()}</span>
            <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-0.5 rounded-full border ${isOutOfStock ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
              {isOutOfStock ? <AlertCircle size={14}/> : <CheckCircle size={14}/>} {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>

          {/* COLOR SELECTION (Unique Colors Only) */}
          {uniqueColors.length > 0 && (
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                Color: <span className="text-black ml-1">{selectedVariant?.colorName}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((v, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      // Find first available storage variant for this color
                      const matchingVariant = variants.find(variant => variant.colorHex === v.colorHex);
                      setSelectedVariant(matchingVariant);
                    }} 
                    onMouseEnter={() => setHoveredImage(v.imageUrl)}
                    onMouseLeave={() => setHoveredImage(null)}
                    className={`w-10 h-10 rounded-full border shadow-sm transition-all duration-200 ${selectedVariant?.colorHex === v.colorHex ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'border-gray-200 hover:scale-110'}`}
                    style={{ backgroundColor: v.colorHex }} 
                    title={v.colorName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STORAGE SELECTION (Filtered by Color) */}
          {availableStorages.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Storage:</span>
              <div className="flex flex-wrap gap-2">
                {availableStorages.map((v, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedVariant(v)} 
                    disabled={v.stock <= 0}
                    className={`
                      px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-200
                      ${selectedVariant?.id === v.id 
                        ? 'border-black bg-black text-white shadow-md' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'} 
                      ${v.stock <= 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}
                    `}
                  >
                    {v.storage || "Standard"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for items without color (like plain keyboards with just options) */}
          {uniqueColors.length === 0 && variants.length > 1 && (
             <div className="mb-8">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Options:</span>
               <div className="flex flex-wrap gap-2">
                 {variants.map((v, i) => (
                   <button key={i} onClick={() => setSelectedVariant(v)} disabled={v.stock <= 0}
                     className={`px-4 py-2 text-xs font-bold rounded-lg border ${selectedVariant?.id === v.id ? 'bg-black text-white' : 'bg-white text-gray-700'}`}>
                     {v.storage || v.colorName || `Option ${i+1}`}
                   </button>
                 ))}
               </div>
             </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-8 border-t border-gray-100 pt-6 line-clamp-3">
            {product.description || "Experience premium quality."}
          </p>

          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
              <div className={`flex items-center border border-gray-200 rounded-full bg-gray-50 px-4 py-2 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-black transition"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                <button onClick={() => setQty(Math.min(currentStock, qty + 1))} className="text-gray-500 hover:text-black transition"><Plus size={16} /></button>
              </div>
              <button 
                disabled={isOutOfStock} 
                onClick={() => { addToCart({...product, quantity: qty, selectedVariant}); onClose(); }}
                className={`flex-1 font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-all transform shadow-lg ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black text-white active:scale-95'}`}
              >
                <ShoppingCart size={18} /> {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;