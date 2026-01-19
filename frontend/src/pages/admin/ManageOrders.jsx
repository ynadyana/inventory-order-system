import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, Search, Bell, User, 
    ChevronRight, Eye, Truck, CheckCircle, Clock, XCircle, Calendar, 
    X, Filter, ChevronDown, ArrowUp, ArrowDown, DollarSign, Activity
} from 'lucide-react';

const ManageOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState({}); // Store products map
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, todaysOrders: 0 });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // -SEARCH & FILTER
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filters, setFilters] = useState({
        status: [], 
        dateSort: 'latest', 
        idSort: null 
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            // Fetch Orders AND Products
            const [orderRes, productRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products')
            ]);

            const orderData = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data.content || []);
            const productData = Array.isArray(productRes.data) ? productRes.data : (productRes.data.content || []);

            // Create a Map of ID -> Product 
            const productMap = {};
            productData.forEach(p => productMap[p.id] = p);

            setOrders(orderData);
            setProducts(productMap);
            calculateStats(orderData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const today = new Date().toDateString();
        setStats({
            totalRevenue: data.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
            pendingCount: data.filter(o => o.status === 'PENDING').length,
            todaysOrders: data.filter(o => new Date(o.orderDate).toDateString() === today).length
        });
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status?status=${newStatus}`, {});
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Status update failed", error);
            alert("Failed to update status.");
        }
    };

    // FILTER LOGIC
    const handleStatusFilter = (status) => {
        setFilters(prev => {
            const exists = prev.status.includes(status);
            return {
                ...prev,
                status: exists ? prev.status.filter(s => s !== status) : [...prev.status, status]
            };
        });
    };

    const filteredAndSortedOrders = orders
        .filter(order => {
            const matchesSearch = 
                String(order.id).includes(searchTerm) || 
                (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status);
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (filters.idSort === 'asc') return a.id - b.id;
            if (filters.idSort === 'desc') return b.id - a.id;
            const dateA = new Date(a.orderDate);
            const dateB = new Date(b.orderDate);
            return filters.dateSort === 'latest' ? dateB - dateA : dateA - dateB;
        });

    const openOrderDetails = (order) => { setSelectedOrder(order); setIsModalOpen(true); };
    
    // LOGOUT
    const handleLogout = () => setShowLogoutConfirm(true); 
    const confirmLogout = () => { 
        localStorage.clear(); 
        navigate('/login'); 
        window.location.reload(); 
    };

    const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

    const getStatusStyles = (status) => {
        switch (status) {
            case 'COMPLETED': return { css: 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100', icon: <CheckCircle className="w-3.5 h-3.5" /> };
            case 'SHIPPED': return { css: 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-100', icon: <Truck className="w-3.5 h-3.5" /> };
            case 'PENDING': return { css: 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-100', icon: <Clock className="w-3.5 h-3.5" /> };
            case 'CANCELLED': return { css: 'bg-red-50 text-red-600 border-red-200 ring-red-100', icon: <XCircle className="w-3.5 h-3.5" /> };
            default: return { css: 'bg-slate-50 text-slate-600 border-slate-200', icon: <Clock className="w-3.5 h-3.5" /> };
        }
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <button onClick={() => navigate(to)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </button>
        );
    };

    return (
        <div className="flex w-full h-full bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* -- SIDEBAR -- */}
            <aside className="w-64 bg-white flex flex-col flex-shrink-0 border-r border-slate-200 z-20 h-full shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
                <div className="p-6 flex-shrink-0 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><LayoutDashboard className="w-5 h-5" /></div>
                    <div><h1 className="text-lg font-bold text-slate-900 leading-tight">TechVault</h1><p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Staff Workspace</p></div>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase px-4 mb-2 tracking-wider">Main Menu</div>
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
                    <NavItem to="/dashboard/products" icon={Package} label="Products" />
                    <NavItem to="/dashboard/orders" icon={ShoppingCart} label="Orders" />
                </nav>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"><LogOut className="w-4 h-4" /><span>Sign Out</span></button>
                </div>
            </aside>

            {/* -- MAIN CONTENT -- */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
                    
                    {/* -- SEARCH & FILTER -- */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search Order ID or Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                        </div>

                        {/* -- FILTER DROPDOWN -- */}
                        <div className="relative">
                            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2 rounded-lg border transition ${showFilterMenu ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Filter className="w-4 h-4" />
                            </button>
                            {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in zoom-in-95">
                                    <div className="space-y-5">
                                        
                                        {/* Status Filter */}
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2.5">Status</p>
                                            <div className="space-y-2">
                                                {['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(status => (
                                                    <label key={status} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition">
                                                        <input type="checkbox" checked={filters.status.includes(status)} onChange={() => handleStatusFilter(status)} className="rounded text-blue-600 focus:ring-blue-500" />
                                                        <span className="text-sm font-medium text-slate-600 capitalize">{status.toLowerCase()}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Date Sort */}
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2.5">Order Date</p>
                                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                                <button onClick={() => setFilters({...filters, dateSort: 'latest', idSort: null})} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${filters.dateSort === 'latest' && !filters.idSort ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Latest</button>
                                                <button onClick={() => setFilters({...filters, dateSort: 'oldest', idSort: null})} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${filters.dateSort === 'oldest' && !filters.idSort ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Oldest</button>
                                            </div>
                                        </div>

                                        <button onClick={() => { setFilters({ status: [], dateSort: 'latest', idSort: null }); setShowFilterMenu(false); }} className="w-full text-xs text-red-600 hover:text-red-700 font-bold hover:underline pt-2 border-t border-slate-100">Reset All Filters</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block"><p className="text-sm font-semibold text-slate-700 leading-none">Staff User</p><p className="text-xs text-slate-500 mt-1">Staff</p></div>
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200"><User className="w-4 h-4" /></div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-6 pb-10">
                        
                        {/* --- STATS DASHBOARD --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Revenue</p><p className="text-2xl font-extrabold text-slate-900 mt-1">RM {stats.totalRevenue.toLocaleString()}</p></div>
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pending Orders</p><p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.pendingCount}</p></div>
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600"><Clock className="w-5 h-5" /></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Today's Orders</p><p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.todaysOrders}</p></div>
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Activity className="w-5 h-5" /></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div><h2 className="text-2xl font-bold text-slate-800">Orders</h2><p className="text-sm text-slate-500 mt-1">Track and manage customer orders.</p></div>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">Total: {filteredAndSortedOrders.length}</span>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                        <tr>
                                            <th className="p-4 pl-6">Order ID</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        {filteredAndSortedOrders.map((order) => {
                                            const statusStyle = getStatusStyles(order.status);
                                            return (
                                                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="p-4 pl-6 font-mono font-medium text-slate-700">#{order.id}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">{(order.userEmail || 'U').charAt(0).toUpperCase()}</div>
                                                            <div><p className="font-semibold text-slate-700">{order.userEmail || "Guest"}</p></div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                                                    <td className="p-4 font-bold text-slate-800">RM {(order.totalAmount || 0).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <div className="relative inline-block group/select">
                                                            <select value={order.status || "COMPLETED"} onChange={(e) => handleStatusChange(order.id, e.target.value)} className={`appearance-none pl-2 pr-8 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all ${statusStyle.css}`}>
                                                                <option value="PENDING">PENDING</option>
                                                                <option value="SHIPPED">SHIPPED</option>
                                                                <option value="COMPLETED">COMPLETED</option>
                                                                <option value="CANCELLED">CANCELLED</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50"><ChevronDown className="w-3 h-3" /></div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button onClick={() => openOrderDetails(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details"><Eye className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredAndSortedOrders.length === 0 && (
                                            <tr><td colSpan="6" className="p-12 text-center text-slate-400"><div className="flex flex-col items-center"><ShoppingCart className="w-12 h-12 mb-3 opacity-10" /><p>No orders found matching your search.</p></div></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* -- ORDER DETAILS MODAL -- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div><h3 className="text-lg font-bold text-slate-800">Order #{selectedOrder.id}</h3><p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Calendar className="w-3 h-3" /> {new Date(selectedOrder.orderDate).toLocaleString()}</p></div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-50 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-slate-50/50">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100"><User className="w-6 h-6" /></div>
                                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Customer</p><p className="font-bold text-slate-800 text-sm">{selectedOrder.userEmail || "Guest User"}</p></div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(selectedOrder.status).css}`}>{getStatusStyles(selectedOrder.status).icon}{selectedOrder.status}</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50"><h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /> Order Items</h4></div>
                                <div className="divide-y divide-slate-50">
                                    {selectedOrder.items.map((item, index) => {
                                        // Lookup Product for Image/Category details
                                        const product = products[item.productId] || {};
                                        return (
                                            <div key={index} className="flex gap-4 p-5 items-center hover:bg-slate-50/50 transition">
                                                <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {getImageUrl(product.imageUrl) ? <img src={getImageUrl(product.imageUrl)} alt={item.productName} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-300" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-slate-800 text-sm">{item.productName || `Product ID: ${item.productId}`}</h5>
                                                    <p className="text-xs text-slate-500 mt-0.5">{product.category || item.variantName || "General Item"}</p>
                                                </div>
                                                <div className="text-right"><div className="text-xs text-slate-500 mb-0.5">Qty: <span className="font-bold text-slate-800">{item.quantity}</span></div><div className="font-bold text-blue-600 text-sm">RM {(item.price || 0).toLocaleString()}</div></div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-slate-50 p-5 flex justify-end border-t border-slate-100"><div className="text-right"><p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Amount</p><p className="text-2xl font-extrabold text-slate-900 mt-1">RM {selectedOrder.totalAmount.toLocaleString()}</p></div></div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end"><button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 text-sm">Close Details</button></div>
                    </div>
                </div>
            )}

            {/* --- CONFIRM LOGOUT --- */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut className="w-6 h-6 text-red-600" /></div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Sign Out?</h3>
                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to end your session?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                                <button onClick={confirmLogout} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20">Sign Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;