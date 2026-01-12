import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3">
             <ShoppingBag size={20} />
             <h2 className="text-lg font-bold text-gray-900 tracking-tight">Your Bag ({cart.length})</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="font-medium">Your bag is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="text-black font-bold underline underline-offset-4">Continue Shopping</button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                <div className="w-24 h-28 bg-[#F5F5F7] rounded-xl overflow-hidden flex-shrink-0 border border-transparent group-hover:border-gray-200 transition-colors">
                  <img src={`http://localhost:8080/${item.imageUrl}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-relaxed">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-2"><Trash2 size={16} /></button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.selectedVariant?.colorName || 'Standard'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-sm">RM{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center hover:text-black text-gray-500"><Minus size={12} /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center hover:text-black text-gray-500"><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            
            {/* Promo Input */}
            <div className="flex gap-2">
               <input type="text" placeholder="Promo Code" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
               <button className="bg-gray-900 text-white font-bold text-xs px-5 rounded-lg hover:bg-black transition">APPLY</button>
            </div>

            <div className="space-y-1 pt-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>RM{subtotal.toLocaleString()}</span>
              </div>
         
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                <span>Total</span>
                <span>RM{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Checkout Now <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;