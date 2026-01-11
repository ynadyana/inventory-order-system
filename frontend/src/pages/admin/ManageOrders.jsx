import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Eye, X, Calendar, User, MapPin } from 'lucide-react';

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [selectedOrder, setSelectedOrder] = useState(null); // The order being viewed
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      // Handle array vs page response
      const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
      // Sort: Newest first
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      // Don't alert for every change, just visual update is smoother
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update status");
    }
  };

  // --- OPEN MODAL ---
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- Sidebar (Same as Products) --- */}
      <div className="w-64 bg-indigo-900 text-white p-6 flex flex-col fixed h-full z-10">
        <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
          <LayoutDashboard /> Staff Panel
        </h1>
        <nav className="flex-1 space-y-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition text-gray-300 hover:text-white">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => navigate('/dashboard/products')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition text-gray-300 hover:text-white">
            <Package className="w-5 h-5" /> Manage Products
          </button>
          <button className="flex items-center gap-3 w-full p-3 bg-indigo-800 rounded-lg text-left text-white shadow-lg">
            <ShoppingCart className="w-5 h-5" /> Manage Orders
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100 mt-auto">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 ml-64 p-8 overflow-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Order Management</h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">Order ID</th>
                <th className="p-4 border-b">Customer</th>
                <th className="p-4 border-b">Total Amount</th>
                <th className="p-4 border-b">Date</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 border-b last:border-0 transition">
                  <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{order.user?.username || "Unknown"}</span>
                        <span className="text-xs text-gray-500">{order.user?.email}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-indigo-600">
                    RM {(order.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <select 
                      value={order.status || "COMPLETED"}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusColor(order.status)}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={() => openOrderDetails(order)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Order Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
             <div className="p-10 text-center text-gray-500">No orders received yet.</div>
          )}
        </div>
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details #{selectedOrder.id}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" /> {new Date(selectedOrder.orderDate).toLocaleString()}
                  </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
                
                {/* Customer Info Section */}
                <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-100 flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Customer</p>
                            <p className="font-medium text-gray-900">{selectedOrder.user?.username || "Guest User"}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                        </div>
                    </div>
                    {/* Placeholder for Address if you add it later */}
                    <div className="flex items-start gap-3 text-right">
                        <div>
                             <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Shipping Status</p>
                             <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                                {selectedOrder.status}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Items in Order
                </h4>
                <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50 items-center">
                             {/* Item Image */}
                             <div className="w-16 h-16 bg-white border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                {item.product && getImageUrl(item.product.imageUrl) ? (
                                    <img 
                                        src={getImageUrl(item.product.imageUrl)} 
                                        alt={item.product.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package className="w-6 h-6" />
                                    </div>
                                )}
                             </div>

                             {/* Item Details */}
                             <div className="flex-1">
                                <h5 className="font-bold text-gray-900">
                                    {item.product ? item.product.name : `Product ID: ${item.productId}`}
                                </h5>
                                <p className="text-sm text-gray-500">
                                    {item.product?.category || "General Item"}
                                </p>
                             </div>

                             {/* Qty & Price */}
                             <div className="text-right">
                                <div className="text-sm text-gray-500">Qty: <span className="font-bold text-gray-900">{item.quantity}</span></div>
                                <div className="font-bold text-indigo-600">RM {(item.price || 0).toLocaleString()}</div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Total Footer */}
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                    <div className="text-right">
                        <p className="text-gray-500 text-sm">Total Amount</p>
                        <p className="text-2xl font-bold text-indigo-700">RM {selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>
                </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition shadow-lg"
                >
                    Close
                </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageOrders;