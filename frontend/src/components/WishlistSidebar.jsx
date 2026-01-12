import { X, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistSidebar = () => {
  const { wishlist, removeFromWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsWishlistOpen(false)}/>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <Heart size={20} className="text-red-500 fill-current" />
             <h2 className="text-lg font-bold text-gray-900">Wishlist ({wishlist.length})</h2>
          </div>
          <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Heart size={48} strokeWidth={1} />
              <p className="font-medium">Your wishlist is empty.</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-24 bg-[#F5F5F7] rounded-xl overflow-hidden flex-shrink-0">
                  <img src={`http://localhost:8080/${item.imageUrl}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                     <div className="flex justify-between">
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">{item.name}</h3>
                        <button onClick={() => removeFromWishlist(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                     </div>
                     <p className="font-bold text-sm mt-1">RM{item.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => { addToCart({ ...item, quantity: 1 }); removeFromWishlist(item.id); }}
                    className="text-xs font-bold text-black border border-gray-200 rounded-lg py-2 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={12} /> Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default WishlistSidebar;