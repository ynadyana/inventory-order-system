import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../lib/axios';
import { CreditCard, Truck, MapPin, Building, ShieldCheck, Lock, X, CheckCircle, Home } from 'lucide-react';

// Images
import maybankLogo from '../assets/maybank.png';
import cimbLogo from '../assets/cimb.png';
import bankIslamLogo from '../assets/bankislam.png';
import bsnLogo from '../assets/bsn.png';
import tngLogo from '../assets/tng.jpg';

const BANKS = [
  { id: 'maybank', name: 'Maybank2u', logo: maybankLogo },
  { id: 'cimb', name: 'CIMB Clicks', logo: cimbLogo },
  { id: 'bankislam', name: 'Bank Islam', logo: bankIslamLogo },
  { id: 'bsn', name: 'BSN', logo: bsnLogo },
  { id: 'tng', name: 'TnG eWallet', logo: tngLogo },
];

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State
  const [shippingMethod, setShippingMethod] = useState('delivery'); 
  const [paymentMethod, setPaymentMethod] = useState('card'); 
  const [selectedBank, setSelectedBank] = useState('');
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', zip: '', state: '' });
  
  // Modals
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTngModal, setShowTngModal] = useState(false);
  
  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [finalOrderData, setFinalOrderData] = useState(null); 

  const TECHVAULT_ADDRESS = "No. 12, Jalan Teknologi 3/5, Kota Damansara, 47810 Petaling Jaya, Selangor";

  const handleInputChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayClick = (e) => {
    e.preventDefault();
    if (shippingMethod === 'delivery' && (!address.fullName || !address.street)) {
        alert("Please fill in address."); return;
    }
    if (paymentMethod === 'online_banking') {
        if (!selectedBank) { alert("Please select a bank."); return; }
        if (selectedBank === 'tng') { setShowTngModal(true); } 
        else { setShowBankModal(true); }
    } else {
        processOrder();
    }
  };

  const processOrder = async () => {
    setLoading(true);
    // Simulate Delay
    setTimeout(async () => {
      try {
        const finalAddress = shippingMethod === 'pickup' 
            ? `[SELF PICKUP] ${TECHVAULT_ADDRESS}`
            : `${address.fullName}, ${address.street}, ${address.zip} ${address.city}`;

        // 1. Calculate final total here to ensure it's captured before clearing cart
        const finalTotal = total + (shippingMethod === 'delivery' ? 10 : 0);

        const orderRequest = {
            totalAmount: finalTotal,
            shippingMethod: shippingMethod.toUpperCase(),
            shippingAddress: finalAddress,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity || 1,
                price: item.price
            }))
        };

        // 2. Call API
        const response = await api.post('/orders', orderRequest);
        
        // 3. Set Receipt Data using the calculated finalTotal
        setOrderId(response.data.id); 
        setFinalOrderData({ 
            ...orderRequest, 
            totalAmount: finalTotal, // Explicitly set total to avoid issues
            date: new Date().toLocaleString() 
        });

        // 4. Clear Cart & Show Receipt
        clearCart();
        setShowBankModal(false);
        setShowTngModal(false);
        setShowReceipt(true); 

      } catch (error) {
        console.error("Order failed", error);
        alert("Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  if (cart.length === 0 && !showReceipt) return <div className="text-center py-20 font-bold text-gray-500">Your cart is empty.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
       
       <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 ${showReceipt ? 'blur-sm pointer-events-none' : ''}`}>
           {/* Left Column (Shipping/Payment) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Truck className="text-indigo-600" /> Shipping Method</h2>
                    
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => setShippingMethod('delivery')} className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium flex items-center justify-center gap-2 ${shippingMethod === 'delivery' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200'}`}><Truck className="w-5 h-5" /> Delivery (RM 10)</button>
                        <button onClick={() => setShippingMethod('pickup')} className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium flex items-center justify-center gap-2 ${shippingMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200'}`}><Building className="w-5 h-5" /> Store Pickup (Free)</button>
                    </div>
                    {shippingMethod === 'delivery' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="text-sm font-medium">Full Name</label><input name="fullName" onChange={handleInputChange} className="w-full p-2 border rounded mt-1" /></div>
                            <div className="md:col-span-2"><label className="text-sm font-medium">Address</label><input name="street" onChange={handleInputChange} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="text-sm font-medium">City</label><input name="city" onChange={handleInputChange} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="text-sm font-medium">Postcode</label><input name="zip" onChange={handleInputChange} className="w-full p-2 border rounded mt-1" /></div>
                        </div>
                    ) : (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-800"><p className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4" /> Collection Point:</p><p className="mt-1">{TECHVAULT_ADDRESS}</p></div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CreditCard className="text-indigo-600" /> Payment Details</h2>
                    <div className="flex border-b border-gray-200 mb-6">
                        <button onClick={() => setPaymentMethod('card')} className={`pb-3 px-4 font-medium text-sm transition ${paymentMethod === 'card' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Credit / Debit Card</button>
                        <button onClick={() => setPaymentMethod('online_banking')} className={`pb-3 px-4 font-medium text-sm transition ${paymentMethod === 'online_banking' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Online Banking (FPX)</button>
                    </div>

                    {paymentMethod === 'card' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-2 mb-4">
                                <span className="font-bold text-blue-800">VISA</span>
                                <span className="font-bold text-red-600">MasterCard</span>
                            </div>
                            <div><label className="text-sm font-medium">Card Number</label><input type="text" placeholder="0000 0000 0000 0000" className="w-full p-2 border rounded mt-1" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium">Expiry</label><input type="text" placeholder="MM/YY" className="w-full p-2 border rounded mt-1" /></div>
                                <div><label className="text-sm font-medium">CVC</label><input type="text" placeholder="123" className="w-full p-2 border rounded mt-1" /></div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'online_banking' && (
                        <div className="grid grid-cols-3 gap-3">
                            {BANKS.map((bank) => (
                                <button key={bank.id} onClick={() => setSelectedBank(bank.id)} className={`p-3 rounded-lg border-2 text-sm font-bold flex flex-col items-center justify-center h-24 transition ${selectedBank === bank.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <img src={bank.logo} alt={bank.name} className="h-10 w-auto object-contain mb-2" />
                                    <span className="text-xs text-center text-gray-700">{bank.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (Summary) */}
            <div className="h-fit">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                <span className="font-medium">RM {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>RM {total.toLocaleString()}</span></div>
                        <div className="flex justify-between text-gray-500">
                            <span>Delivery</span>
                            <span className="font-medium text-gray-900">
                                {shippingMethod === 'delivery' ? 'RM 10' : 'Free'}
                            </span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 pt-4 border-t border-dashed border-gray-200"><span>Total</span><span>RM {(total + (shippingMethod === 'pickup' ? 0 : 10)).toLocaleString()}</span></div>
                    </div>

                    <button onClick={handlePayClick} className="w-full mt-6 py-4 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95">
                        <ShieldCheck className="w-5 h-5" /> Pay Now
                    </button>
                </div>
            </div>
       </div>

      {/* --- Bank Modal --- */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-green-600" /><span className="font-bold text-gray-700">Secure FPX Gateway</span></div>
                    <button onClick={() => setShowBankModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-8 flex flex-col items-center">
                    <img src={BANKS.find(b => b.id === selectedBank)?.logo} className="h-16 mb-6 object-contain" />
                    <div className="w-full space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Username</label><input type="text" className="w-full p-3 border rounded-lg bg-gray-50" /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Password</label><input type="password" className="w-full p-3 border rounded-lg bg-gray-50" /></div>
                        <button onClick={processOrder} disabled={loading} className="w-full py-3 bg-indigo-900 text-white rounded-lg font-bold hover:bg-indigo-800 transition">{loading ? "Processing..." : "Login & Pay"}</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* --- TnG Modal --- */}
      {showTngModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><span className="font-bold">TnG eWallet Payment</span><button onClick={() => setShowTngModal(false)}><X className="w-5 h-5" /></button></div>
                <div className="p-6">
                    <div className="flex justify-center mb-6"><img src={tngLogo} className="h-16 object-contain" /></div>
                    <div className="space-y-4">
                        <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); processOrder(); }, 1500) }} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">{loading ? "Processing..." : "Simulate Pay"}</button>
                    </div>
                </div>
            </div>
         </div>
      )}

      {/* --- SUCCESS RECEIPT MODAL --- */}
      {showReceipt && finalOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col items-center p-8 text-center">
                
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                
                <p className="text-gray-500 mb-8">
                    Your order has been placed successfully!
                </p>

                <div className="bg-gray-50 rounded-xl p-6 w-full border border-gray-100 mb-8 text-left">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <span className="text-gray-500 text-sm">Order ID</span>
                        <span className="font-bold font-mono">#{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <span className="text-gray-500 text-sm">Date</span>
                        <span className="font-medium text-sm">{finalOrderData.date}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <span className="text-gray-500 text-sm">Payment Method</span>
                        <span className="font-medium text-sm capitalize">{paymentMethod === 'card' ? 'Credit Card' : 'FPX / E-Wallet'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Total Paid</span>
                        <span className="font-bold text-xl text-indigo-600">RM {finalOrderData.totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="w-full">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-900 text-white rounded-xl font-bold hover:bg-indigo-800 transition"
                    >
                        <Home className="w-5 h-5" /> Go Home
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-6">Need help? Contact support@techvault.com</p>
            </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;