import { X, Minus, Plus, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const QuickView = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition-colors z-10">
          <X size={20} />
        </button>

        {/* Left: Product Gallery */}
        <div className="w-full md:w-1/2 bg-[#f5f5f5] p-12 flex items-center justify-center relative">
          {product.stock <= 0 && (
             <span className="absolute top-6 left-6 bg-gray-500 text-white text-xs font-bold px-3 py-1 uppercase">Sold Out</span>
          )}
          <img 
            src={`http://localhost:8080/${product.imageUrl}`} 
            className="w-full h-auto object-contain mix-blend-multiply" 
            alt={product.name} 
          />
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2 uppercase tracking-tight">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-red-500">RM{product.price.toLocaleString()}</span>
            <span className="text-gray-400 line-through text-lg">RM{(product.price * 1.1).toLocaleString()}</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            {product.description || "Premium high-performance tech gear designed for professionals. Featuring the latest hardware and sleek modern design."}
          </p>

          <div className="mt-auto space-y-6">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)}><Plus size={16} /></button>
              </div>
              
              <button 
                onClick={() => { addToCart({...product, quantity: qty}); onClose(); }}
                className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-100"
              >
                <ShoppingCart size={18} /> ADD TO CART
              </button>
              
              <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition">
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