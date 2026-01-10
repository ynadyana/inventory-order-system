import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext'; // <--- Import

const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // <--- Get function
  
  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : "https://via.placeholder.com/300";

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group h-full">
      <div className="h-64 bg-gray-50 flex items-center justify-center relative p-6">
        <img 
          src={getImageUrl(product.imageUrl)} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
          <button 
            onClick={() => addToCart(product)} // <--- CLICK HANDLER
            className="p-2 bg-gray-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;