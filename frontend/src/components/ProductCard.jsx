import { Eye } from 'lucide-react';
import { useState } from 'react';

const ProductCard = ({ product, viewSize, onQuickView }) => {
  const isSoldOut = product.stock <= 0;
  // State to track which color variant is being hovered
  const [selectedColor, setSelectedColor] = useState(null);

  // Mock colors for the demonstration (You can later pull these from your DB)
  const colors = [
    { name: 'Silver', class: 'bg-gray-200' },
    { name: 'Lime', class: 'bg-[#e2e98c]' },
    { name: 'Black', class: 'bg-black' }
  ];

  const titleSize = viewSize === 7 ? 'text-[10px]' : 'text-[13px]';
  const priceSize = viewSize === 7 ? 'text-[11px]' : 'text-sm';

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square bg-[#f6f6f6] mb-3 overflow-hidden">
        {isSoldOut && (
          <span className="absolute top-2 right-2 bg-[#999] text-white text-[8px] px-1.5 py-0.5 uppercase z-10">
            Sold out
          </span>
        )}

        <img 
          src={`http://localhost:8080/${product.imageUrl}`} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          alt={product.name}
        />

        {!isSoldOut && (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickView(); }}
              className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            >
              <Eye size={16} /> 
              {viewSize < 7 && "Quick view"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className={`${titleSize} font-medium text-gray-800 uppercase leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors`}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
           <span className={`${priceSize} font-bold text-red-600`}>
             RM {product.price?.toLocaleString()}
           </span>
           <span className="text-[10px] text-gray-400 line-through">
             RM {(product.price * 1.1).toLocaleString()}
           </span>
        </div>

        {/* Color Variant Dots */}
        {viewSize < 7 && (
          <div className="flex gap-2 mt-2 py-1">
            {colors.map((color, index) => (
              <div
                key={index}
                onMouseEnter={() => setSelectedColor(color.name)}
                onMouseLeave={() => setSelectedColor(null)}
                className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${
                  selectedColor === color.name ? 'border-gray-900 scale-110' : 'border-transparent'
                } ${color.class}`}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;