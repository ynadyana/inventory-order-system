import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios'; 

const Cart = () => {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : "https://via.placeholder.com/300";

  const handleCheckout = async () => {
    try {
      const orderRequest = {
        totalAmount: total,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price
        }))
      };

      await api.post('/orders', orderRequest);
      
      alert("🎉 Order Placed Successfully!");
      clearCart(); 
      navigate('/'); 
    } catch (error) {
      console.error("Checkout failed:", error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert("Please login as a Customer to place an order.");
        navigate('/login');
      } else {
        alert("Something went wrong with the checkout.");
      }
    }
  };

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
      <Link to="/" className="text-blue-600 hover:underline">Start Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-6 p-6 border-b border-gray-100 last:border-0">
            <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded-lg" />
            
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.category}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg">${item.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
            </div>

            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <div className="p-8 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-gray-500">Total Amount:</span>
            <div className="text-3xl font-bold text-gray-900">${total.toLocaleString()}</div>
          </div>
          <button 
            onClick={handleCheckout}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition font-bold"
          >
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;