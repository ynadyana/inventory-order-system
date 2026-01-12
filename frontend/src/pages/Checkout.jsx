import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../lib/axios';
import { CreditCard, Truck, MapPin, Building, ShieldCheck, Lock, X, CheckCircle, Home, ChevronDown } from 'lucide-react';

// --- IMAGES ---
import maybankLogo from '../assets/maybank.png';
import cimbLogo from '../assets/cimb.png';
import bankIslamLogo from '../assets/bankislam.png';
import bsnLogo from '../assets/bsn.png';
import tngLogo from '../assets/tng.jpg';
import visaLogo from '../assets/Visa.png';   // Added Visa
import masterLogo from '../assets/master.png'; // Added Master

const BANKS = [
  { id: 'maybank', name: 'Maybank2u', logo: maybankLogo },
  { id: 'cimb', name: 'CIMB Clicks', logo: cimbLogo },
  { id: 'bankislam', name: 'Bank Islam', logo: bankIslamLogo },
  { id: 'bsn', name: 'BSN', logo: bsnLogo },
  { id: 'tng', name: 'TnG eWallet', logo: tngLogo },
];

const MALAYSIA_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
    "Pahang", "Penang", "Perak", "Perlis", "Sabah", 
    "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
];

const Checkout = () => {
  const { cart, total, clearCart, updateItemVariant } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [shippingMethod, setShippingMethod] = useState('delivery'); 
  const [paymentMethod, setPaymentMethod] = useState('card'); 
  const [selectedBank, setSelectedBank] = useState('');
  
  const [address, setAddress] = useState({ 
      firstName: '', lastName: '', street: '', apartment: '', city: '', postcode: '', state: 'Selangor', phone: '' 
  });
  
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTngModal, setShowTngModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [finalOrderData, setFinalOrderData] = useState(null); 

  const TECHVAULT_ADDRESS = "No. 12, Jalan Teknologi 3/5, Kota Damansara, 47810 Petaling Jaya, Selangor";

  const handleInputChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayClick = (e) => {
    e.preventDefault();
    if (shippingMethod === 'delivery') {
        if (!address.firstName || !address.lastName || !address.street || !address.city || !address.postcode || !address.phone) {
            alert("Please fill in all required address fields."); return;
        }
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
    setTimeout(async () => {
      try {
        const fullAddress = `${address.firstName} ${address.lastName}, ${address.street}, ${address.apartment ? address.apartment + ', ' : ''}${address.postcode} ${address.city}, ${address.state}, Malaysia. Phone: ${address.phone}`;
        const finalAddress = shippingMethod === 'pickup' ? `[SELF PICKUP] ${TECHVAULT_ADDRESS}` : fullAddress;
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

        const response = await api.post('/orders', orderRequest);
        
        setOrderId(response.data.id); 
        setFinalOrderData({ ...orderRequest, totalAmount: finalTotal, date: new Date().toLocaleString() });

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
           
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. SHIPPING DETAILS */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900"><Truck className="text-black" /> Delivery Options</h2>
                    
                    <div className="flex gap-4 mb-8">
                        <button onClick={() => setShippingMethod('delivery')} className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-3 transition-all ${shippingMethod === 'delivery' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                            <Truck className="w-5 h-5" /> Delivery (RM 10)
                        </button>
                        <button onClick={() => setShippingMethod('pickup')} className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-3 transition-all ${shippingMethod === 'pickup' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                            <Building className="w-5 h-5" /> Store Pickup (Free)
                        </button>
                    </div>

                    {shippingMethod === 'delivery' ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country/Region</label><input type="text" value="Malaysia" disabled className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-medium" /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label><input name="firstName" placeholder="e.g. Ali" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label><input name="lastName" placeholder="e.g. Abu" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label><input name="street" placeholder="Street address" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Apartment (Optional)</label><input name="apartment" placeholder="Unit no, floor, etc." onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postcode</label><input name="postcode" placeholder="e.g. 47810" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                                <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label><input name="city" placeholder="e.g. PJ" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                                <div className="relative"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label><div className="relative"><select name="state" value={address.state} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer">{MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select><ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" /></div></div>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label><input name="phone" placeholder="e.g. 0123456789" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" /></div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 text-blue-900 flex items-start gap-3">
                            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div><p className="font-bold">Collection Point:</p><p className="mt-1 leading-relaxed text-sm">{TECHVAULT_ADDRESS}</p><p className="mt-2 text-xs font-bold uppercase text-blue-700">Open 10:00 AM - 10:00 PM</p></div>
                        </div>
                    )}
                </div>

                {/* 2. PAYMENT DETAILS */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900"><CreditCard className="text-black" /> Payment</h2>
                    <div className="flex border-b border-gray-200 mb-6">
                        <button onClick={() => setPaymentMethod('card')} className={`pb-3 px-4 font-medium text-sm transition border-b-2 ${paymentMethod === 'card' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Credit / Debit Card</button>
                        <button onClick={() => setPaymentMethod('online_banking')} className={`pb-3 px-4 font-medium text-sm transition border-b-2 ${paymentMethod === 'online_banking' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Online Banking (FPX)</button>
                    </div>

                    {paymentMethod === 'card' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* --- FIXED LOGOS HERE --- */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-4 mb-4 items-center h-16">
                                <img src={visaLogo} alt="Visa" className="h-full w-auto object-contain mix-blend-multiply" />
                                <img src={masterLogo} alt="Mastercard" className="h-full w-auto object-contain mix-blend-multiply" />
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label><input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label><input type="text" placeholder="MM/YY" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVC</label><input type="text" placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'online_banking' && (
                        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
                            {BANKS.map((bank) => (
                                <button key={bank.id} onClick={() => setSelectedBank(bank.id)} className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center justify-center h-28 transition bg-white ${selectedBank === bank.id ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}>
                                    <img src={bank.logo} alt={bank.name} className="h-10 w-auto object-contain mb-3" />
                                    <span className="text-xs text-center text-gray-700">{bank.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT COLUMN (SUMMARY) --- */}
            <div className="h-fit">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                    
                    <div className="space-y-6 mb-6 max-h-[400px] overflow-y-auto px-2 pt-4 custom-scrollbar">
                        {cart.map((item, index) => {
                            const hasVariants = item.variants && item.variants.length > 0;
                            const currentVariant = item.selectedVariant;

                            return (
                                <div key={`${item.id}-${index}`} className="flex gap-4">
                                    <div className="relative w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-visible">
                                        <img 
                                            // --- IMAGE BASED ON COLOR ---
                                            src={currentVariant?.imageUrl ? `http://localhost:8080/${currentVariant.imageUrl}` : `http://localhost:8080/${item.imageUrl}`} 
                                            alt={item.name} 
                                            className="w-full h-full object-contain mix-blend-multiply p-2" 
                                        />
                                        <span className="absolute -top-2 -right-2 z-10 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md ring-2 ring-white">
                                            {item.quantity}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{item.name}</h4>
                                            {hasVariants ? (
                                                <div className="mt-2">
                                                    <div className="relative inline-block">
                                                        <select 
                                                            value={currentVariant?.colorName}
                                                            onChange={(e) => {
                                                                const newVar = item.variants.find(v => v.colorName === e.target.value);
                                                                if(newVar) updateItemVariant(item.id, currentVariant, newVar);
                                                            }}
                                                            className="appearance-none bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 pl-2 pr-6 py-1 rounded cursor-pointer hover:border-gray-400 focus:outline-none"
                                                        >
                                                            {item.variants.map(v => {
                                                                const isSoldOut = (v.stock || 0) <= 0;
                                                                return (
                                                                    <option key={v.colorName} value={v.colorName} disabled={isSoldOut}>
                                                                        {v.colorName} {isSoldOut ? '(Sold Out)' : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                        <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1.5 pointer-events-none" />
                                                    </div>
                                                </div>
                                            ) : <p className="text-xs text-gray-500 mt-1">Standard</p>}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 text-right mt-1">RM {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>RM {total.toLocaleString()}</span></div>
                        <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="font-medium text-gray-900">{shippingMethod === 'delivery' ? 'RM 10' : 'Free'}</span></div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 pt-4 border-t border-dashed border-gray-200"><span>Total</span><span>RM {(total + (shippingMethod === 'delivery' ? 10 : 0)).toLocaleString()}</span></div>
                    </div>

                    <button onClick={handlePayClick} className="w-full mt-6 py-4 rounded-xl font-bold text-white bg-black hover:bg-gray-800 shadow-xl transition flex items-center justify-center gap-2 transform active:scale-95">
                        <ShieldCheck className="w-5 h-5" /> Pay Now
                    </button>
                </div>
            </div>
       </div>

      {/* --- Modals remain unchanged ... */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-green-600" /><span className="font-bold text-gray-700">Secure FPX Gateway</span></div>
                    <button onClick={() => setShowBankModal(false)}><X className="w-5 h-5 text-gray-500 hover:text-red-500" /></button>
                </div>
                <div className="p-8 flex flex-col items-center">
                    <img src={BANKS.find(b => b.id === selectedBank)?.logo} className="h-16 mb-6 object-contain" />
                    <div className="w-full space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Username</label><input type="text" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none" /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Password</label><input type="password" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-black outline-none" /></div>
                        <button onClick={processOrder} disabled={loading} className="w-full py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition shadow-lg">{loading ? "Processing..." : "Login & Pay"}</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {showTngModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><span className="font-bold">TnG eWallet Payment</span><button onClick={() => setShowTngModal(false)}><X className="w-5 h-5 hover:text-gray-200" /></button></div>
                <div className="p-6">
                    <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-xl"><img src={tngLogo} className="h-16 object-contain" /></div>
                    <div className="space-y-4">
                        <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); processOrder(); }, 1500) }} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">{loading ? "Processing..." : "Simulate Pay"}</button>
                    </div>
                </div>
            </div>
         </div>
      )}

      {showReceipt && finalOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col items-center p-10 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Payment Successful!</h2>
                <p className="text-gray-500 mb-10">Your order has been placed successfully!</p>
                <div className="bg-gray-50 rounded-2xl p-6 w-full border border-gray-100 mb-8 text-left">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200"><span className="text-gray-500 text-sm font-medium">Order ID</span><span className="font-bold font-mono text-gray-900">#{orderId}</span></div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200"><span className="text-gray-500 text-sm font-medium">Date</span><span className="font-bold text-sm text-gray-900">{finalOrderData.date}</span></div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200"><span className="text-gray-500 text-sm font-medium">Payment Method</span><span className="font-bold text-sm text-gray-900 capitalize">{paymentMethod === 'card' ? 'Credit Card' : 'FPX / E-Wallet'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500 text-sm font-medium">Total Paid</span><span className="font-extrabold text-2xl text-black">RM {finalOrderData.totalAmount.toLocaleString()}</span></div>
                </div>
                <div className="w-full"><button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"><Home className="w-5 h-5" /> Back to Home</button></div>
                <p className="text-xs text-gray-400 mt-8">Need help? Contact support@techvault.com</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;