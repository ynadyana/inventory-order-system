import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { LayoutDashboard, Package, ShoppingCart, LogOut, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State for Real Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Orders to calculate Revenue & Count
      const orderRes = await api.get('/orders');
      const orderList = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data.content || []);
      
      const revenue = orderList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const orderCount = orderList.length;

      // 2. Fetch Products to count Inventory
      const productRes = await api.get('/products');
      const productList = Array.isArray(productRes.data) ? productRes.data : (productRes.data.content || []);
      
      setStats({
        totalRevenue: revenue,
        totalOrders: orderCount,
        totalProducts: productList.length
      });

    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white p-6 flex flex-col fixed h-full">
        <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
          <LayoutDashboard /> Staff Panel
        </h1>
        <nav className="flex-1 space-y-4">
          <button className="flex items-center gap-3 w-full p-3 bg-indigo-800 rounded-lg text-left shadow-lg">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => navigate('/dashboard/products')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition text-gray-300 hover:text-white">
            <Package className="w-5 h-5" /> Manage Products
          </button>
          <button onClick={() => navigate('/dashboard/orders')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition text-gray-300 hover:text-white">
            <ShoppingCart className="w-5 h-5" /> Manage Orders
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100 mt-auto">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Store Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                   RM {stats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 font-medium">
                +100% from last month
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalOrders}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
                Lifetime orders
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Products</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalProducts}
                </h3>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
                In inventory
            </div>
          </div>

        </div>

        {/* Recent Activity Section */}
        <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex gap-4">
                <button onClick={() => navigate('/dashboard/products')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow">
                    Add New Product
                </button>
                <button onClick={() => navigate('/dashboard/orders')} className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
                    View Pending Orders
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;