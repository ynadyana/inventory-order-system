import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const Toast = () => {
  const { toastData, hideToast } = useToast();
  const { setIsCartOpen, cart } = useCart(); // Get Sidebar toggle and cart count
  const navigate = useNavigate();

  if (!toastData) return null;

  return (
    <div className="fixed top-24 right-5 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
            <CheckCircle size={18} fill="currentColor" className="text-green-100" />
            <span>Added to Bag</span>
          </div>
          <button onClick={hideToast} className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-4 pt-0 flex gap-4">
          <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
            <img 
              src={`http://localhost:8080/${toastData.imageUrl}`} 
              alt={toastData.name} 
              className="w-full h-full object-contain mix-blend-multiply" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{toastData.name}</h4>
            <p className="text-gray-500 text-xs mt-1">{toastData.selectedVariant?.colorName || 'Standard'}</p>
            <p className="text-gray-900 font-bold text-sm mt-1">RM {toastData.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3 bg-gray-50/50 border-t border-gray-100">
          <button 
            onClick={() => {
              setIsCartOpen(true);
              hideToast();
            }}
            className="w-full py-2.5 rounded-full border border-gray-300 text-sm font-bold text-gray-900 hover:border-gray-900 hover:bg-gray-50 transition-all bg-white"
          >
            View Bag ({cart.length})
          </button>

          <button 
            onClick={() => {
              navigate('/checkout');
              hideToast();
            }}
            className="w-full py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Toast;