import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
           <span className="text-4xl">💔</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mt-2">Looks like you haven't found anything you love yet.</p>
        </div>
        <Link 
          to="/" 
          className="bg-black text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlist.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
            
            {/* Remove Button */}
            <button 
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
              title="Remove from Wishlist"
            >
              <Trash2 size={18} />
            </button>

            {/* Image */}
            <Link to={`/product/${product.id}`} className="block relative h-48 bg-gray-50 rounded-lg overflow-hidden mb-4">
               <img 
                 src={product.imageUrl ? `http://localhost:8080/${product.imageUrl}` : "https://via.placeholder.com/300"} 
                 alt={product.name}
                 className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
               />
            </Link>

            {/* Info */}
            <div>
              <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
              <p className="text-blue-600 font-bold mb-4">RM{product.price.toLocaleString()}</p>
              
              <button 
                onClick={() => addToCart({ ...product, quantity: 1 })}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;