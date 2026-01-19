import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, TrendingUp, 
    User, AlertTriangle, Clock, ArrowUpRight, CheckCircle, 
    Truck, XCircle, ChevronRight 
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATE ---
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, activeProducts: 0 });
    const [lowStockItems, setLowStockItems] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- LOGOUT CONFIRMATION STATE ---
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Initial Data Fetch
    useEffect(() => { 
        fetchDashboardData(); 
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [orderRes, productRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products')
            ]);

            const orders = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data.content || []);
            const products = Array.isArray(productRes.data) ? productRes.data : (productRes.data.content || []);

            // --- DATA PROCESSING ---
            const revenue = orders
                .filter(o => o.status !== 'CANCELLED')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            const lowStock = products.map(p => {
                const totalStock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || p.stock || 0;
                return { ...p, totalStock };
            }).filter(p => p.totalStock <= 3).slice(0, 4);

            const recent = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString();
            });

            const chartData = last7Days.map(date => {
                const dayRevenue = orders
                    .filter(o => new Date(o.orderDate).toLocaleDateString() === date && o.status !== 'CANCELLED')
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                return { label: dayName, value: dayRevenue };
            });

            setStats({ totalRevenue: revenue, totalOrders: orders.length, activeProducts: products.length });
            setLowStockItems(lowStock);
            setRecentActivity(recent);
            setChartData(chartData);

        } catch (error) {
            console.error("Dashboard Error", error);
        } finally {
            setLoading(false);
        }
    };

    // --- GENERATE REPORT FUNCTION ---
    const handleGenerateReport = () => {
        window.print();
    };

    const handleLogoutClick = () => setShowLogoutConfirm(true);
    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return { icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100' };
            case 'SHIPPED': return { icon: <Truck className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50 border-blue-100' };
            case 'CANCELLED': return { icon: <XCircle className="w-4 h-4 text-red-600" />, bg: 'bg-red-50 border-red-100' };
            default: return { icon: <Clock className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50 border-amber-100' };
        }
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/dashboard');
        return (
            <button onClick={() => navigate(to)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </button>
        );
    };

    return (
        <div className="flex w-full h-full bg-slate-50 overflow-hidden font-sans text-slate-800">
            
            {/* --- REPORT PRINT STYLES --- */}
            <style>
            {`
                @media print {
                    /* Hide sidebar, buttons, and popups */
                    aside, header, button, .no-print { display: none !important; }
                    /* Reset layout for printing */
                    body, main { background: white !important; overflow: visible !important; height: auto !important; }
                    main { padding: 0 !important; }
                    /* Hide scrollbars */
                    ::-webkit-scrollbar { display: none; }
                    /* Ensure charts and colors print */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    /* Add a report title */
                    .dashboard-title::after { content: " - Generated Report"; }
                }
            `}
            </style>

            {/* SIDEBAR */}
            <aside className="w-64 bg-white flex flex-col flex-shrink-0 border-r border-slate-200 z-20 h-full shadow-[2px_0_20px_rgba(0,0,0,0.02)] no-print">
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
                    <button onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"><LogOut className="w-4 h-4" /><span>Sign Out</span></button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative">
                
                {/* HEADER - Bell Removed */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 flex-shrink-0 z-10 no-print">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-700 leading-none">Staff User</p>
                                <p className="text-xs text-slate-500 mt-1">Staff</p>
                            </div>
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-8 pb-10">
                        
                        {/* Welcome & Report Button */}
                        <div className="flex justify-between items-end">
                            <div><h2 className="dashboard-title text-2xl font-bold text-slate-800">Dashboard Overview</h2><p className="text-sm text-slate-500 mt-1">Welcome back, here is what's happening today.</p></div>
                            
                            {/* GENERATE REPORT BUTTON */}
                            <button 
                                onClick={handleGenerateReport} 
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition flex items-center gap-2 no-print"
                            >
                                <ArrowUpRight className="w-4 h-4" /> Generate Report
                            </button>
                        </div>

                        {/* 1. Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <StatCard title="Total Revenue" value={`RM ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="green" trend="+12%" />
                            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="blue" trend="+5 today" />
                            <StatCard title="Active Products" value={stats.activeProducts} icon={Package} color="purple" trend="In Stock" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 2. Sales Trend Chart */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div><h3 className="font-bold text-slate-800 text-sm">Sales Trends</h3><p className="text-xs text-slate-500">Revenue over the last 7 days</p></div>
                                </div>
                                <div className="h-64 w-full">
                                    <SimpleLineChart data={chartData} />
                                </div>
                            </div>

                            {/* 3. Low Stock Alerts */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                                <div className="px-6 py-4 border-b border-slate-100 bg-red-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <h3 className="font-bold text-red-700 text-sm">Low Stock Alerts</h3>
                                    </div>
                                    <span className="text-[10px] bg-white border border-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{lowStockItems.length} items</span>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {lowStockItems.length > 0 ? lowStockItems.map((item) => {
                                        const displayImage = item.imageUrl || (item.variants && item.variants.length > 0 ? item.variants[0].imageUrl : null);
                                        return (
                                            <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate('/dashboard/products')}>
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold border border-slate-200 overflow-hidden flex-shrink-0">
                                                    {getImageUrl(displayImage) ? (
                                                        <img src={getImageUrl(displayImage)} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : <Package className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-red-500 font-semibold">Only {item.totalStock} left</p>
                                                </div>
                                                <button className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-white hover:border-blue-300 hover:text-blue-600 transition no-print">Restock</button>
                                            </div>
                                        );
                                    }) : (
                                        <div className="p-8 text-center text-slate-400 text-xs">Inventory Healthy</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4. Recent Activity Feed */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
                                <button onClick={() => navigate('/dashboard/orders')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 no-print">View All <ChevronRight className="w-3 h-3" /></button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {recentActivity.length > 0 ? recentActivity.map((order) => {
                                    const style = getStatusIcon(order.status);
                                    return (
                                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition cursor-pointer" onClick={() => navigate('/dashboard/orders')}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${style.bg}`}>
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Order #{order.id} <span className="font-normal text-slate-500">placed by</span> {order.username || order.userEmail || "Guest"}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.orderDate).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900">RM {order.totalAmount.toLocaleString()}</p>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide text-slate-500`}>{order.status}</span>
                                            </div>
                                        </div>
                                    );
                                }) : <div className="p-8 text-center text-slate-400 text-sm">No recent activity found.</div>}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* --- CONFIRM LOGOUT (Hidden in print) --- */}
            {showLogoutConfirm && (
                <div className="no-print fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
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

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colors = { green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' }, blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }, purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' } };
    const c = colors[color];
    return (<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-blue-300 transition-all duration-200 group"><div className="flex justify-between items-start mb-3"><div className={`p-2.5 rounded-lg ${c.bg} ${c.text} border ${c.border}`}><Icon className="w-5 h-5" /></div><span className={`text-[11px] font-bold px-2 py-1 rounded-full ${c.bg} ${c.text}`}>{trend}</span></div><div><p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{title}</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3></div></div>);
};

const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div>;
    const maxVal = Math.max(...data.map(d => d.value)) || 100;
    const points = data.map((d, i) => { const x = (i / (data.length - 1)) * 100; const y = 100 - (d.value / maxVal) * 80; return `${x},${y}`; }).join(' ');
    return (<div className="w-full h-full flex flex-col justify-end relative pl-0 pr-0 pt-4"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible"><defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#chartGradient)" /><polyline points={points} fill="none" stroke="#2563EB" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{data.map((d, i) => { const x = (i / (data.length - 1)) * 100; const y = 100 - (d.value / maxVal) * 80; return (<circle key={i} cx={x} cy={y} r="1.5" fill="#fff" stroke="#2563EB" strokeWidth="1" className="hover:r-2 transition-all cursor-pointer"><title>{d.label}: RM {d.value}</title></circle>); })}</svg><div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">{data.map((d, i) => <span key={i}>{d.label}</span>)}</div></div>);
};

export default Dashboard;