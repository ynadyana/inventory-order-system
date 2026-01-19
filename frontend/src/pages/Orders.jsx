import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ShoppingBag, ChevronDown, ChevronUp, Store, CheckCircle, Calendar, Package, Filter, ArrowUpDown, Search, XCircle, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  
  // --- FILTER & SORT STATE ---
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, productRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products')
      ]);
      
      const productList = Array.isArray(productRes.data) ? productRes.data : (productRes.data.content || []);
      const productMap = {};
      productList.forEach(p => { productMap[p.id] = p; });

      const rawOrders = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data.content || []);
      
      setOrders(rawOrders);
      setProducts(productMap);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

  // --- FILTERING & SORTING LOGIC ---
  const filteredOrders = orders
    .filter(order => {
        if (statusFilter === 'ALL') return true;
        return order.status === statusFilter;
    })
    .sort((a, b) => {
        const dateA = new Date(a.orderDate); 
        const dateB = new Date(b.orderDate);
        return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
    });

  const getStatusStyle = (status) => {
      switch (status) {
          case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
          case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
          case 'SHIPPED': return 'bg-blue-50 text-blue-700 border-blue-100';
          case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
          default: return 'bg-gray-50 text-gray-700 border-gray-100';
      }
  };

  const getStatusIcon = (status) => {
      switch (status) {
          case 'COMPLETED': return <CheckCircle className="w-3.5 h-3.5" />;
          case 'PENDING': return <Clock className="w-3.5 h-3.5" />;
          case 'SHIPPED': return <Truck className="w-3.5 h-3.5" />;
          case 'CANCELLED': return <XCircle className="w-3.5 h-3.5" />;
          default: return <Package className="w-3.5 h-3.5" />;
      }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* --- HEADER & TITLES --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-indigo-600" /> My Purchases
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your recent orders.</p>
          </div>
          
          <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition text-sm shadow-sm">
              Continue Shopping
          </Link>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          
          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                        statusFilter === status 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
              ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By:</span>
              <div className="relative">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:bg-gray-100 transition"
                  >
                      <option value="NEWEST">Newest First</option>
                      <option value="OLDEST">Oldest First</option>
                  </select>
                  <ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
          </div>
      </div>

      {/* --- ORDERS LIST --- */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 text-sm mb-6">Try changing your filters or place a new order.</p>
            <Link to="/" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                Browse Products
            </Link>
        </div>
      ) : (
        <div className="space-y-6">
            {filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            const itemsToShow = isExpanded ? order.items : [order.items[0]];
            const remainingItems = order.items.length - 1;

            return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                
                {/* --- Card Header --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-100 bg-gray-50/50 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-indigo-600 shadow-sm">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(order.status)}`}>
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {/* FIX: Using order.orderDate instead of createdAt */}
                                {new Date(order.orderDate).toLocaleString('en-US', { 
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-left sm:text-right w-full sm:w-auto pl-[56px] sm:pl-0">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900">RM {(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* --- Items List --- */}
                <div className="p-5 space-y-6">
                    {itemsToShow.map((item, index) => {
                        const product = products[item.productId] || {};
                        // Use Order Item DTO name first (safe), then Product Catalog name
                        const productName = item.productName || product.name || `Product #${item.productId}`;
                        const productVariant = item.variantName || product.category || "Standard";
                        
                        return (
                            <div key={index} className="flex gap-5 group">
                                {/* Product Image */}
                                <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {getImageUrl(product.imageUrl) ? (
                                        <img 
                                            src={getImageUrl(product.imageUrl)} 
                                            alt={productName} 
                                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <Package className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="text-base font-bold text-gray-900 line-clamp-1">
                                        {productName}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Variant: <span className="font-medium text-gray-700">{productVariant}</span>
                                    </p>
                                </div>
                                
                                <div className="text-right flex flex-col justify-center">
                                    <p className="text-xs text-gray-500 mb-1">x{item.quantity}</p>
                                    <p className="text-sm font-bold text-indigo-600">
                                        RM {(item.price || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- View More Toggle --- */}
                {order.items.length > 1 && (
                    <div 
                        onClick={() => toggleOrder(order.id)}
                        className="px-5 pb-4 cursor-pointer group flex justify-center"
                    >
                        <span className="text-xs font-bold text-gray-400 group-hover:text-indigo-600 transition flex items-center gap-1 select-none bg-gray-50 px-3 py-1 rounded-full">
                            {isExpanded ? "Show Less" : `View ${remainingItems} more item${remainingItems > 1 ? 's' : ''}`}
                            {isExpanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                        </span>
                    </div>
                )}

                {/* --- Card Footer --- */}
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                    <Link 
                        to="/" 
                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 hover:text-black hover:border-gray-400 transition shadow-sm flex items-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" /> Buy Again
                    </Link>
                </div>

                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default Orders;