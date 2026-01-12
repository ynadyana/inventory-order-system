import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import Navigation Hook

const ProductCard = ({ product, onQuickView }) => {
  const navigate = useNavigate(); // 2. Initialize Navigation

  // Handle stock check (compatible with old and new data)
  const stockCount = product.totalStock !== undefined ? product.totalStock : product.stock;
  const isSoldOut = stockCount <= 0;
  
  const [activeImage, setActiveImage] = useState(null); 

  const currentImage = activeImage || product.imageUrl;
  
  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

  // Safe variant list extraction
  const variants = product.variants || product.colors || [];

  return (
    <div 
      // 3. ENABLE NAVIGATION: Clicking the card goes to details page
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer flex flex-col h-full bg-white rounded-xl p-3 hover:shadow-lg transition-shadow duration-300"
    >
      
      {/* --- IMAGE SECTION --- */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden group/image">

      {isSoldOut && (
          <span className="absolute top-2 right-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 uppercase z-20 rounded-sm tracking-wider">
            Sold out
          </span>
        )}

        <img 
          src={getFullUrl(currentImage)} 
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/image:scale-110"
          alt={product.name}
        />

        {/* Quick View Button (Visible on Hover) */}
        {!isSoldOut && (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); // 4. PREVENT NAV: Clicking 'Quick View' keeps you on the current page
                onQuickView(); 
              }}
              className="bg-white text-gray-900 px-5 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 transform translate-y-4 group-hover/image:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white"
            >
              <Eye size={16} /> Quick View
            </button>
          </div>
        )}
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm font-bold text-gray-900">
           RM {product.price?.toLocaleString()}
        </p>

        {/* --- DYNAMIC COLOR DOTS --- */}
        {variants.length > 0 && (
          <div className="flex gap-2 mt-2 h-5 items-center">
            {variants.map((variant, index) => {
              
              // 5. Robust Color Extraction (Matches QuickView Logic)
              const colorHex = typeof variant === 'string' 
                  ? variant 
                  : (variant.colorHex || variant.colorValue || variant.color || '#000000');

              // 6. Check Individual Variant Stock
              // If variant.stock is missing, we assume it's in stock (default to 10) to be safe
              const isVariantSoldOut = variant.stock !== undefined && variant.stock <= 0;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveImage(variant.imageUrl)}
                  onMouseLeave={() => setActiveImage(null)}
                  // 7. Apply Color & Diagonal Line
                  style={{ 
                    backgroundColor: colorHex,
                    backgroundImage: isVariantSoldOut 
                      ? 'linear-gradient(to top right, transparent 48%, red 48%, red 52%, transparent 52%)' 
                      : 'none',
                    opacity: isVariantSoldOut ? 0.6 : 1
                  }} 
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-sm cursor-pointer transition-all hover:scale-110 hover:border-gray-500"
                  title={isVariantSoldOut ? "Out of Stock" : ""}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;