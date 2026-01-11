import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../lib/axios';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

const Payment = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Calculate Total
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [cardData, setCardData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const handleInputChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Delay (2 Seconds)
    setTimeout(async () => {
      try {
        // 2. Prepare Data for Backend
        const orderData = {
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: totalAmount
        };

        // 3. Deduct Stock & Save Order
        await api.post('/orders', orderData);

        // 4. Success! Clear cart and redirect
        clearCart();
        alert("Payment Successful! Order Placed.");
        navigate('/orders'); // Redirect to Order History

      } catch (error) {
        console.error("Payment failed", error);
        alert("Transaction Failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 2000); // 2 seconds delay
  };

  if (cart.length === 0) return <div className="text-center py-20">Your cart is empty.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- LEFT: Order Summary --- */}
        <div className="bg-gray-100 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
            <div className="space-y-4 mb-4">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} (x{item.quantity})</span>
                        <span className="font-medium">RM {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-300 pt-4 flex justify-between text-lg font-bold">
                <span>Total to Pay</span>
                <span className="text-indigo-600">RM {totalAmount.toLocaleString()}</span>
            </div>
        </div>

        {/* --- RIGHT: Payment Form --- */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-indigo-700">
                <ShieldCheck className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Secure Payment</h2>
            </div>
            
            <form onSubmit={handlePayment} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input 
                        type="text" name="name" required placeholder="e.g. JOHN DOE"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={handleInputChange}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" name="cardNumber" required placeholder="0000 0000 0000 0000" maxLength="19"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input 
                            type="text" name="expiry" required placeholder="MM/YY" maxLength="5"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" name="cvc" required placeholder="123" maxLength="3"
                                className="w-full pl-9 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-white text-lg transition shadow-lg flex justify-center items-center gap-2
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {loading ? (
                        <>Processing...</>
                    ) : (
                        <>Pay RM {totalAmount.toLocaleString()}</>
                    )}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> 128-bit SSL Encrypted Connection
                </p>
            </form>
        </div>

      </div>
    </div>
  );
};

export default Payment;