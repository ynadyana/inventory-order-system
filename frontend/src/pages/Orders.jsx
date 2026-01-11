import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ShoppingBag, ChevronDown, ChevronUp, Store, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const orderRes = await api.get('/orders');
      const productRes = await api.get('/products');
      
      const productList = Array.isArray(productRes.data) 
          ? productRes.data 
          : (productRes.data.content || []);

      const productMap = {};
      productList.forEach(p => {
        productMap[p.id] = p;
      });

      // Sort: Newest orders on top
      const sortedOrders = orderRes.data.sort((a, b) => b.id - a.id);

      setOrders(sortedOrders);
      setProducts(productMap);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : "https://via.placeholder.com/150";

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-20 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
            Start Shopping
        </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-indigo-600" /> My Purchases
      </h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedOrders[order.id];
          const itemsToShow = isExpanded ? order.items : [order.items[0]];
          const remainingItems = order.items.length - 1;

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              
              {/* --- Card Header --- */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-gray-600" /> 
                      <span className="font-bold text-gray-800">TechVault Official</span>
                      <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-100" /> {/* Verified Icon */}
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                      {order.status || "Completed"}
                  </span>
              </div>

              {/* --- Items List --- */}
              <div className="p-5 space-y-6">
                  {itemsToShow.map((item, index) => {
                      const product = products[item.productId] || {};
                      return (
                          <div key={index} className="flex gap-5">
                              {/* Product Image */}
                              <div className="w-24 h-24 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                                  <img 
                                      src={getImageUrl(product.imageUrl)} 
                                      alt={product.name} 
                                      className="w-full h-full object-cover"
                                  />
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                          {product.name || `Product ID: ${item.productId}`}
                                      </h3>
                                      <p className="text-gray-500 text-sm mt-1">
                                          {product.category || "General Variant"}
                                      </p>
                                  </div>
                                  
                                  <div className="flex justify-between items-end mt-2">
                                      <span className="text-gray-500 text-sm">Qty: {item.quantity}</span>
                                      <span className="text-indigo-600 font-bold text-lg">
                                          RM {(item.price || 0).toLocaleString()}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>

              {/* --- View More Toggle --- */}
              {order.items.length > 1 && (
                  <div 
                      onClick={() => toggleOrder(order.id)}
                      className="px-5 pb-2 cursor-pointer group"
                  >
                      <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition flex items-center gap-1 font-medium">
                          {isExpanded ? "Show Less" : `View ${remainingItems} more item${remainingItems > 1 ? 's' : ''}`}
                          {isExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                      </span>
                  </div>
              )}

              {/* --- Card Footer --- */}
              <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
                  <div className="text-gray-500 text-sm">
                      Order ID: <span className="font-mono text-gray-700">#{order.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                      <div className="text-right">
                          <span className="text-gray-500 text-sm mr-2">Order Total:</span>
                          <span className="text-2xl font-bold text-gray-900">
                              RM {(order.totalAmount || 0).toLocaleString()}
                          </span>
                      </div>
                      
                      <Link 
                          to="/" 
                          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 active:transform active:scale-95 transition-all shadow-md hover:shadow-lg"
                      >
                          Buy Again
                      </Link>
                  </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;