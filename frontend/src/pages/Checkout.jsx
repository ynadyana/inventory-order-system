import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../lib/axios';
import { isTokenExpired, getTokenTimeRemaining } from '../utils/auth';
import { CreditCard, Truck, MapPin, Building, ShieldCheck, Lock, X, Home, Sparkles, AlertTriangle, Clock, Printer, Store } from 'lucide-react';

// --- IMAGES ---
import maybankLogo from '../assets/maybank.png';
import cimbLogo from '../assets/cimb.png';
import bankIslamLogo from '../assets/bankislam.png';
import bsnLogo from '../assets/bsn.png';
import tngLogo from '../assets/tng.jpg';
import visaLogo from '../assets/Visa.png';   
import masterLogo from '../assets/master.png'; 

const BANKS = [
  { id: 'maybank', name: 'Maybank2u', logo: maybankLogo, color: '#ffc800' },
  { id: 'cimb', name: 'CIMB Clicks', logo: cimbLogo, color: '#ed1c24' },
  { id: 'bankislam', name: 'Bank Islam', logo: bankIslamLogo, color: '#d31145' },
  { id: 'bsn', name: 'BSN', logo: bsnLogo, color: '#00a3e0' },
  { id: 'tng', name: 'TnG eWallet', logo: tngLogo, color: '#01529f' },
];

const MALAYSIA_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
    "Pahang", "Penang", "Perak", "Perlis", "Sabah", 
    "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
];

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tokenTimeLeft, setTokenTimeLeft] = useState(null);

  const [shippingMethod, setShippingMethod] = useState('delivery'); 
  const [paymentMethod, setPaymentMethod] = useState('card'); 
  const [selectedBank, setSelectedBank] = useState('');
  
  const [bankUsername, setBankUsername] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  
  const [address, setAddress] = useState({ 
      firstName: '', lastName: '', street: '', apartment: '', city: '', postcode: '', state: 'Selangor', phone: '' 
  });
  
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTngModal, setShowTngModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  const [finalOrderData, setFinalOrderData] = useState(null); 

  const TECHVAULT_ADDRESS = "No. 12, Jalan Teknologi 3/5, Kota Damansara, 47810 Petaling Jaya, Selangor";

  const discountAmount = total >= 500 ? 50 : 0;
  const deliveryFee = shippingMethod === 'delivery' ? 10 : 0;
  const finalTotal = total + deliveryFee - discountAmount;

  useEffect(() => {
    const checkTokenValidity = () => {
      if (isTokenExpired()) {
        setShowSessionExpired(true);
        return;
      }
      const timeLeft = getTokenTimeRemaining();
      setTokenTimeLeft(timeLeft);
      if (timeLeft < 300 && timeLeft > 0) {
        console.warn(`Token expiring soon: ${Math.floor(timeLeft / 60)} minutes remaining`);
      }
    };
    checkTokenValidity();
    const interval = setInterval(checkTokenValidity, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayClick = (e) => {
    e.preventDefault();
    if (isTokenExpired()) { setShowSessionExpired(true); return; }

    if (shippingMethod === 'delivery') {
        if (!address.firstName || !address.lastName || !address.street || !address.city || !address.postcode || !address.phone) {
            alert("Please fill in all required address fields."); 
            return;
        }
    }

    if (paymentMethod === 'online_banking') {
        if (!selectedBank) { alert("Please select a bank."); return; }
        if (selectedBank === 'tng') { setShowTngModal(true); } else { 
            setBankUsername(''); setBankPassword(''); setShowBankModal(true); 
        }
    } else {
        processOrder();
    }
  };

  const processOrder = async () => {
    if (isTokenExpired()) {
      setShowBankModal(false); setShowTngModal(false); setShowSessionExpired(true); return;
    }

    setLoading(true);
    
    setTimeout(async () => {
      try {
        const fullAddress = `${address.firstName} ${address.lastName}, ${address.street}, ${address.apartment ? address.apartment + ', ' : ''}${address.postcode} ${address.city}, ${address.state}, Malaysia. Phone: ${address.phone}`;
        const finalAddress = shippingMethod === 'pickup' ? `[SELF PICKUP] ${TECHVAULT_ADDRESS}` : fullAddress;

        const orderRequest = {
            totalAmount: finalTotal,
            shippingMethod: shippingMethod.toUpperCase(),
            shippingAddress: finalAddress,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity || 1,
                price: item.price,
                variantName: item.selectedVariant?.colorName || "Standard"
            }))
        };

        const response = await api.post('/orders', orderRequest);
        
        // --- FIXED: Get Username from Storage ---
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const loggedInUsername = storedUser.username || storedUser.email?.split('@')[0];

        // Determine Name: Use Form Name if Delivery, otherwise use Account Username
        const receiptName = (shippingMethod === 'delivery' && address.firstName) 
            ? `${address.firstName} ${address.lastName}` 
            : (loggedInUsername || "Valued Customer");

        // Determine Phone: Use Form Phone if Delivery, otherwise use Account Email
        const receiptContact = address.phone || (storedUser.email || "-");

        setFinalOrderData({
            id: response.data.id,
            date: new Date(),
            totalAmount: finalTotal,
            shippingMethod: shippingMethod.toUpperCase(),
            shippingAddress: finalAddress,
            customerName: receiptName,
            customerContact: receiptContact,
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity || 1,
                price: item.price,
                imageUrl: item.selectedVariant?.imageUrl || item.imageUrl,
                variantName: item.selectedVariant?.colorName || "Standard"
            }))
        });

        clearCart();
        setShowBankModal(false);
        setShowTngModal(false);
        setShowReceipt(true); 

      } catch (error) {
        console.error("Order failed", error);
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            setShowBankModal(false); setShowTngModal(false); setShowSessionExpired(true);
        } else {
            alert("Payment failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 2000); 
  };

  const handleSessionExpiredRelogin = () => {
    localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('user');
    navigate('/login', { state: { from: '/checkout', message: 'Your session expired. Please login again.' } });
  };

  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

  if (cart.length === 0 && !showReceipt) return <div className="text-center py-20 font-bold text-gray-500">Your cart is empty.</div>;

  const currentBank = BANKS.find(b => b.id === selectedBank);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
       {/* Token Expiry */}
       {tokenTimeLeft !== null && tokenTimeLeft < 300 && tokenTimeLeft > 0 && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-50 border-2 border-amber-200 rounded-xl px-6 py-3 shadow-lg animate-pulse">
           <div className="flex items-center gap-3 text-amber-800"><Clock className="w-5 h-5" /><span className="font-bold text-sm">Session expires soon!</span></div>
         </div>
       )}

       <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 ${showReceipt || showBankModal || showTngModal || showSessionExpired ? 'blur-sm pointer-events-none' : ''}`}>
           {/* LEFT: Shipping & Payment */}
           <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900"><Truck className="text-black" /> Delivery Options</h2>
                   <div className="flex gap-4 mb-8">
                       <button onClick={() => setShippingMethod('delivery')} className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-3 transition-all ${shippingMethod === 'delivery' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}><Truck className="w-5 h-5" /> Delivery (RM 10)</button>
                       <button onClick={() => setShippingMethod('pickup')} className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold flex items-center justify-center gap-3 transition-all ${shippingMethod === 'pickup' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}><Building className="w-5 h-5" /> Store Pickup (Free)</button>
                   </div>
                   {shippingMethod === 'delivery' ? (
                       <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                               <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label><input name="firstName" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" /></div>
                               <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label><input name="lastName" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" /></div>
                           </div>
                           <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label><input name="street" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" /></div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                               <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postcode</label><input name="postcode" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" /></div>
                               <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label><input name="city" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" /></div>
                               <div className="relative"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label><select name="state" value={address.state} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer">{MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                           </div>
                           <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label><input name="phone" onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" /></div>
                       </div>
                   ) : (
                       <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 text-blue-900 flex items-start gap-3"><MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" /><div><p className="font-bold">Collection Point:</p><p className="mt-1 leading-relaxed text-sm">{TECHVAULT_ADDRESS}</p></div></div>
                   )}
               </div>

               <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900"><CreditCard className="text-black" /> Payment</h2>
                   <div className="flex border-b border-gray-200 mb-6">
                       <button onClick={() => setPaymentMethod('card')} className={`pb-3 px-4 font-medium text-sm transition border-b-2 ${paymentMethod === 'card' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>Credit / Debit Card</button>
                       <button onClick={() => setPaymentMethod('online_banking')} className={`pb-3 px-4 font-medium text-sm transition border-b-2 ${paymentMethod === 'online_banking' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>Online Banking (FPX)</button>
                   </div>
                   {paymentMethod === 'card' ? (
                       <div className="space-y-4">
                           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-4 mb-4 items-center h-16"><img src={visaLogo} className="h-full w-auto object-contain mix-blend-multiply"/><img src={masterLogo} className="h-full w-auto object-contain mix-blend-multiply"/></div>
                           <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label><input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                           <div className="grid grid-cols-2 gap-4">
                               <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label><input type="text" placeholder="MM/YY" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                               <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVC</label><input type="text" placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                           </div>
                       </div>
                   ) : (
                       <div className="grid grid-cols-3 gap-3">
                           {BANKS.map((bank) => (
                               <button key={bank.id} onClick={() => setSelectedBank(bank.id)} className={`p-4 rounded-xl border-2 text-sm font-bold flex flex-col items-center justify-center h-28 transition bg-white ${selectedBank === bank.id ? 'border-black ring-1 ring-black' : 'border-gray-100'}`}><img src={bank.logo} className="h-10 w-auto object-contain mb-3" /><span className="text-xs text-center text-gray-700">{bank.name}</span></button>
                           ))}
                       </div>
                   )}
               </div>
           </div>

           {/* RIGHT: Summary */}
           <div className="h-fit">
               <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                   <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                   <div className="space-y-6 mb-6 max-h-[400px] overflow-y-auto px-2 pt-4 custom-scrollbar">
                       {cart.map((item, index) => (
                           <div key={`${item.id}-${index}`} className="flex gap-4">
                               <div className="relative w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
                                   <img src={getImageUrl(item.selectedVariant?.imageUrl || item.imageUrl)} className="w-full h-full object-contain mix-blend-multiply p-2" />
                                   <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{item.quantity}</span>
                               </div>
                               <div className="flex-1">
                                   <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{item.name}</h4>
                                   {item.selectedVariant && <p className="text-xs text-gray-500 mt-1">{item.selectedVariant.colorName}</p>}
                                   <p className="text-sm font-bold text-gray-900 text-right mt-1">RM {(item.price * item.quantity).toLocaleString()}</p>
                               </div>
                           </div>
                       ))}
                   </div>
                   <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                       <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>RM {total.toLocaleString()}</span></div>
                       {discountAmount > 0 && <div className="flex justify-between text-green-600 animate-pulse"><span className="flex items-center gap-1 font-bold"><Sparkles className="w-3 h-3" /> Spring Sale Discount</span><span className="font-bold">-RM {discountAmount}</span></div>}
                       <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="font-medium text-gray-900">{shippingMethod === 'delivery' ? 'RM 10' : 'Free'}</span></div>
                       <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 pt-4 border-t border-dashed border-gray-200"><span>Total</span><span>RM {finalTotal.toLocaleString()}</span></div>
                   </div>
                   <button onClick={handlePayClick} className="w-full mt-6 py-4 rounded-xl font-bold text-white bg-black hover:bg-gray-800 shadow-xl transition flex items-center justify-center gap-2 transform active:scale-95"><ShieldCheck className="w-5 h-5" /> Pay Now</button>
               </div>
           </div>
       </div>
       
       {/* BANK MODALS */}
       {showBankModal && currentBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col items-center relative">
                    <button onClick={() => setShowBankModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20}/></button>
                    <img src={currentBank.logo} alt={currentBank.name} className="h-12 w-auto object-contain mb-2" />
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Lock size={12}/> Secure FPX Gateway</span>
                </div>
                <div className="p-8 space-y-5">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label><input type="text" value={bankUsername} onChange={(e) => setBankUsername(e.target.value)} className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Enter username"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label><input type="password" value={bankPassword} onChange={(e) => setBankPassword(e.target.value)} className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Enter password"/></div>
                    <div className="pt-2"><button onClick={processOrder} disabled={loading || !bankUsername || !bankPassword} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">{loading ? "Authorizing Payment..." : `Login to ${currentBank.name}`}</button></div>
                </div>
            </div>
        </div>
       )}

       {showSessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div><h2 className="text-2xl font-bold text-gray-900">Session Expired</h2></div>
                <div className="p-8 text-center space-y-4"><p className="text-gray-700 leading-relaxed">Your login session has expired.</p><button onClick={handleSessionExpiredRelogin} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg mt-6"><Lock className="w-5 h-5" /> Login Again</button></div>
            </div>
        </div>
       )}
       
       {/* --- NEW PROFESSIONAL INVOICE DESIGN --- */}
       {showReceipt && finalOrderData && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            
            {/* PRINT CSS FIX: Collapses background page to 0 height */}
            <style>
            {`
                @media print {
                    body { height: 0; overflow: hidden; visibility: hidden; }
                    #receipt-content {
                        position: absolute; left: 0; top: 0; width: 100%;
                        visibility: visible; background: white; z-index: 9999;
                        padding: 40px; margin: 0;
                    }
                    #receipt-content * { visibility: visible; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}
            </style>

            <div id="receipt-content" className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-none">
                
                {/* CLEAN WHITE HEADER */}
                <div className="p-10 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-black rounded flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
                            <span className="text-xl font-bold tracking-tight text-black">TechVault</span>
                        </div>
                        <div className="text-sm text-gray-500 leading-relaxed">
                            <p>No. 12, Jalan Teknologi 3/5,</p>
                            <p>Kota Damansara, 47810</p>
                            <p>Petaling Jaya, Selangor</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-light text-gray-300 tracking-wide mb-1">INVOICE</h2>
                        <p className="text-gray-500 font-mono text-sm mb-1">#{finalOrderData.id}</p>
                        <p className="text-gray-500 text-sm">{finalOrderData.date.toLocaleDateString()}</p>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-10 overflow-y-auto custom-scrollbar">
                    
                    {/* CUSTOMER & DETAILS GRID */}
                    <div className="grid grid-cols-2 gap-10 mb-10">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Billed To</p>
                            <p className="font-bold text-gray-800 text-sm mb-1">{finalOrderData.customerName}</p>
                            <p className="text-sm text-gray-500">{finalOrderData.customerContact}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ship To</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {finalOrderData.shippingMethod === 'PICKUP' ? 'Store Pickup' : finalOrderData.shippingAddress}
                            </p>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <table className="w-full mb-8 border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100 text-left">
                                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/2">Item Description</th>
                                <th className="pb-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                                <th className="pb-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="pb-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {finalOrderData.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 pr-4">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Variant: {item.variantName}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center text-sm font-medium text-gray-700">{item.quantity}</td>
                                    <td className="py-4 text-right text-sm text-gray-600">RM {item.price.toLocaleString()}</td>
                                    <td className="py-4 text-right text-sm font-bold text-gray-800">RM {(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* TOTALS */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>RM {(finalOrderData.totalAmount - (finalOrderData.shippingMethod === 'DELIVERY' ? 10 : 0) + (discountAmount)).toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm text-gray-500"><span>Delivery</span><span>{finalOrderData.shippingMethod === 'DELIVERY' ? 'RM 10.00' : 'Free'}</span></div>
                            {discountAmount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>- RM {discountAmount}</span></div>}
                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                <span className="text-sm font-bold text-gray-900">Total Paid</span>
                                <span className="text-xl font-bold text-black">RM {finalOrderData.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER BUTTONS (HIDDEN IN PRINT) */}
                <div className="no-print p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button onClick={() => window.print()} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-white transition flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Print Receipt</button>
                    <button onClick={() => navigate('/')} className="flex-[2] py-3 px-4 rounded-lg bg-black text-white font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-md"><Home className="w-4 h-4" /> Return Home</button>
                </div>
            </div>
        </div>
       )}
    </div>
  );
};

export default Checkout;