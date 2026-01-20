import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onQuickView }) => {
  const navigate = useNavigate(); 
  
  // --- LOGIC: Stock ---
  const stockCount = product.totalStock !== undefined ? product.totalStock : product.stock;
  const isSoldOut = stockCount <= 0;

  // --- LOGIC: SPECIFIC DISCOUNTS ---
  const getTargetedDiscount = (name, currentPrice) => {
    const lowerName = name.toLowerCase();
    let percent = 0;

    if (lowerName.includes("asus rog")) {
        percent = 16; 
    } else if (lowerName.includes("sony wh")) {
        percent = 23; 
    } else if (lowerName.includes("gmmk pro")) {
        percent = 10; 
    }

    if (percent === 0) return { originalPrice: null, percent: 0 };

    const originalPrice = currentPrice * (1 + (percent / 100));
    return { originalPrice, percent };
  };

  const { originalPrice, percent } = getTargetedDiscount(product.name, product.price);
  const hasDiscount = percent > 0;
  
  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

  // Main Image
  const currentImage = product.imageUrl;

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30"
    >
      
      {/* --- BADGES --- */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {!isSoldOut && hasDiscount && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            -{percent}%
          </span>
        )}
        {isSoldOut && (
          <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* --- IMAGE AREA --- */}
      <div className="relative w-full aspect-[10/9] bg-gray-50 overflow-hidden group/image">
        <img 
          src={getFullUrl(currentImage)} 
          className={`w-full h-full object-contain mix-blend-multiply p-6 transition-transform duration-700 ease-out group-hover/image:scale-110 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
          alt={product.name}
        />

        {/* Floating Quick View Button */}
        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 translate-y-4 group-hover/image:opacity-100 group-hover/image:translate-y-0 transition-all duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickView(); }}
              className="bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 text-[11px] font-bold hover:bg-black hover:text-white transition-colors hover:border-black"
            >
              <Eye size={13} /> Quick View
            </button>
          </div>
        )}
      </div>

      {/* --- INFO AREA --- */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{product.category || "Gear"}</p>
        
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto">
          {/* Price Block */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-gray-900">RM{product.price.toLocaleString()}</span>
            
            {hasDiscount && (
                <span className="text-xs text-gray-400 line-through font-medium">
                    RM{originalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;