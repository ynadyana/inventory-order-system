import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Trash2, Edit, 
    X, Image as ImageIcon, Search, Bell, Filter, User, ChevronDown, Layers, 
    Info, AlertTriangle, CheckCircle, XCircle, Check, ArrowRight, Minus
} from 'lucide-react';

const ManageProducts = () => {
    const navigate = useNavigate();
    
    // --- DATA STATE ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // --- FILTER & SEARCH STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filters, setFilters] = useState({ categories: [], status: [], priceSort: null });

    // --- UI STATE ---
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // --- MODALS STATE ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    // --- FEEDBACK STATE ---
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

    // --- FORMS ---
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock: '', category: '', brand: '', image: null
    });

    const [variantForm, setVariantForm] = useState({
        id: null, colorName: '', colorValue: '#000000', storage: '', price: '', stock: 0, sku: '', image: null
    });

    const [stockAdjustment, setStockAdjustment] = useState(0);
    const [enableColor, setEnableColor] = useState(false);
    const [enableStorage, setEnableStorage] = useState(false);

    // Initial Fetch
    useEffect(() => { 
        fetchProducts(); 
        fetchCategories();
    }, []);

    // --- DATA FETCHING ---
    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
            setProducts(data);
        } catch (error) { showNotification('error', "Error fetching products"); } 
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            const uniqueCats = Array.from(new Set([...res.data, "Laptop", "Smartphone", "Accessories", "Audio", "GPU"]));
            setCategories(uniqueCats.sort());
        } catch (error) { console.error("Error fetching categories:", error); }
    };

    // --- HELPERS ---
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    const closeConfirmModal = () => setConfirmModal({ show: false, title: '', message: '', onConfirm: null });

    const calculateTotalStock = (product) => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
        }
        return product.stock || 0;
    };

    const getPriceDisplay = (product) => {
        const prices = product.variants?.map(v => v.price).filter(p => p !== null && p > 0) || [];
        if (product.price) prices.push(product.price);
        if (prices.length === 0) return "N/A";
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return `RM ${min.toLocaleString()}`;
        return `RM ${min.toLocaleString()} - RM ${max.toLocaleString()}`;
    };

    const toggleExpand = (id) => setExpandedProductId(prev => prev === id ? null : id);
    const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

    // --- FILTER LOGIC ---
    const handleCategoryFilterChange = (category) => {
        setFilters(prev => {
            const exists = prev.categories.includes(category);
            return { ...prev, categories: exists ? prev.categories.filter(c => c !== category) : [...prev.categories, category] };
        });
    };

    const handleStatusFilterChange = (status) => {
        setFilters(prev => {
            const exists = prev.status.includes(status);
            return { ...prev, status: exists ? prev.status.filter(s => s !== status) : [...prev.status, status] };
        });
    };

    const filteredAndSortedProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filters.categories.length === 0 || filters.categories.includes(p.category);
        
        const totalStock = calculateTotalStock(p);
        let matchesStatus = true;
        if (filters.status.length > 0) {
            matchesStatus = false;
            if (filters.status.includes('inStock') && totalStock > 0) matchesStatus = true;
            if (filters.status.includes('lowStock') && totalStock <= 3) matchesStatus = true;
            if (filters.status.includes('outOfStock') && totalStock === 0) matchesStatus = true;
        }
        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
        if (filters.priceSort === 'asc') return a.price - b.price;
        if (filters.priceSort === 'desc') return b.price - a.price;
        return b.id - a.id; 
    });

    // --- PRODUCT ACTIONS ---
    const openAddProductModal = () => {
        setProductForm({ name: '', description: '', price: '', stock: '', category: '', brand: '', image: null });
        setIsEditing(false);
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (product) => {
        setProductForm({
            name: product.name, 
            description: product.description, 
            price: product.price,
            stock: calculateTotalStock(product), 
            category: product.category,
            brand: product.brand || '', 
            image: null 
        });
        setCurrentProductId(product.id);
        setIsEditing(true);
        setIsProductModalOpen(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', productForm.name);
            data.append('description', productForm.description);
            data.append('price', productForm.price);
            data.append('stock', productForm.stock);
            data.append('category', productForm.category);
            data.append('brand', productForm.brand);
            if (productForm.image) data.append('image', productForm.image);

            if (isEditing) {
                const updateJson = {
                    name: productForm.name, description: productForm.description,
                    price: Number(productForm.price), category: productForm.category,
                    brand: productForm.brand
                };
                await api.put(`/products/${currentProductId}`, updateJson);
                showNotification('success', "Product updated successfully!");
            } else {
                await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                showNotification('success', "New product created successfully!");
            }
            setIsProductModalOpen(false);
            fetchProducts();
            fetchCategories(); 
        } catch (error) { showNotification('error', "Failed to save product."); }
        finally { setIsSubmitting(false); }
    };

    // --- VARIANT ACTIONS ---
    const openAddVariantModal = (productId) => {
        setCurrentProductId(productId);
        setVariantForm({ id: null, colorName: '', colorValue: '#000000', storage: '', price: '', stock: 0, sku: '', image: null });
        setEnableColor(false); setEnableStorage(false); setIsVariantModalOpen(true);
    };

    const openEditVariantModal = (variant, productId) => {
        setCurrentProductId(productId);
        const safeColor = variant.colorName === "Standard" ? "" : (variant.colorName || "");
        const safeStorage = variant.storage === "Standard" ? "" : (variant.storage || "");
        setVariantForm({ id: variant.id, colorName: safeColor, colorValue: variant.colorHex || '#000000', storage: safeStorage, price: variant.price || '', stock: variant.stock, sku: variant.sku || '', image: null });
        setEnableColor(!!safeColor); setEnableStorage(!!safeStorage); setIsVariantModalOpen(true);
    };

    const handleVariantSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const variantData = {
                colorName: enableColor ? variantForm.colorName : null,
                colorHex: enableColor ? variantForm.colorValue : null,
                storage: enableStorage ? variantForm.storage : null,
                price: variantForm.price ? Number(variantForm.price) : null,
                stock: Number(variantForm.stock),
                sku: variantForm.sku
            };
            const formData = new FormData();
            formData.append('data', new Blob([JSON.stringify(variantData)], { type: 'application/json' }));
            if (variantForm.image) formData.append('image', variantForm.image);
            if (variantForm.id) { await api.put(`/variants/${variantForm.id}`, variantData); } 
            else { await api.post(`/products/${currentProductId}/variants`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); }
            showNotification('success', "Variant saved successfully!");
            setIsVariantModalOpen(false);
            fetchProducts(); 
        } catch (error) { showNotification('error', "Failed to save variant."); }
        finally { setIsSubmitting(false); }
    };

    const confirmStockUpdate = async () => {
        const newStock = Number(variantForm.stock) + stockAdjustment;
        if (newStock < 0) { showNotification('error', "Stock cannot be negative!"); return; }
        setIsSubmitting(true);
        try {
            if (variantForm.id) {
                await api.put(`/variants/${variantForm.id}/stock?newStock=${newStock}`);
                showNotification('success', "Stock updated!");
                fetchProducts();
            } 
            setVariantForm(prev => ({ ...prev, stock: newStock }));
            setIsStockModalOpen(false);
        } catch (error) { showNotification('error', "Failed to update stock."); }
        finally { setIsSubmitting(false); }
    };

    // --- DELETE HANDLERS ---
    const handleDeleteProduct = (id) => {
        setConfirmModal({
            show: true, title: "Delete Product?", message: "This will permanently delete the product and all its variants. This action cannot be undone.",
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await api.delete(`/products/${id}`);
                    setProducts(products.filter(p => p.id !== id));
                    showNotification('success', "Product deleted.");
                } catch (e) { showNotification('error', "Could not delete product."); }
                finally { setIsSubmitting(false); closeConfirmModal(); }
            }
        });
    };

    const handleDeleteVariant = (vid, pid) => {
        setConfirmModal({
            show: true, title: "Delete Variant?", message: "Are you sure you want to delete this variant? The total stock will be recalculated.",
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await api.delete(`/variants/${vid}`);
                    setProducts(prev => prev.map(p => { if (p.id !== pid) return p; return { ...p, variants: p.variants.filter(v => v.id !== vid) }; }));
                    showNotification('success', "Variant deleted.");
                } catch (e) { showNotification('error', "Failed to delete variant."); }
                finally { setIsSubmitting(false); closeConfirmModal(); }
            }
        });
    };

    // --- UI HELPERS & LOGOUT ---
    const openStockModal = () => { setStockAdjustment(0); setIsStockModalOpen(true); };
    const handleProductInputChange = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });
    const handleLogout = () => setShowLogoutConfirm(true); 
    const confirmLogout = () => { localStorage.clear(); navigate('/login'); window.location.reload(); };

    // Styles
    const inputBaseClasses = "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500";
    const labelClasses = "block text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wide";
    const primaryButtonClasses = "px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
    const secondaryButtonClasses = "px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors active:scale-[0.98]";

    return (
        <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
            
            {/* --- TOAST --- */}
            <div className={`fixed top-6 right-6 z-[100] transition-all duration-300 transform ${notification.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' : 'bg-white border-red-100 text-red-800'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-bold">{notification.message}</span>
                </div>
            </div>

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm flex-shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><LayoutDashboard className="w-5 h-5" /></div>
                    <div><h1 className="text-base font-extrabold">TechVault</h1><p className="text-xs text-slate-500">Admin Workspace</p></div>
                </div>
                <nav className="flex-1 px-3 space-y-1 mt-4">
                    <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"><LayoutDashboard className="w-5 h-5 text-slate-400" />Overview</button>
                    <button onClick={() => navigate('/dashboard/products')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-medium"><Package className="w-5 h-5 text-blue-600" />Products</button>
                    <button onClick={() => navigate('/dashboard/orders')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"><ShoppingCart className="w-5 h-5 text-slate-400" />Orders</button>
                </nav>
                <div className="p-3 border-t border-slate-100 mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"><LogOut className="w-5 h-5" /><span>Sign Out</span></button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2 rounded-lg border transition ${showFilterMenu || filters.categories.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Filter className="w-4 h-4" /></button>
                            {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in zoom-in-95">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Category</p>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                {categories.map(cat => (
                                                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                                        <input type="checkbox" checked={filters.categories.includes(cat)} onChange={() => handleCategoryFilterChange(cat)} className="rounded text-blue-600" />
                                                        <span className="text-sm text-slate-700">{cat}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Status</p>
                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"><input type="checkbox" checked={filters.status.includes('inStock')} onChange={() => handleStatusFilterChange('inStock')} className="rounded text-blue-600" /><span className="text-sm text-slate-700">Have Stocks</span></label>
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"><input type="checkbox" checked={filters.status.includes('lowStock')} onChange={() => handleStatusFilterChange('lowStock')} className="rounded text-blue-600" /><span className="text-sm text-slate-700">Low in Stock (≤ 3)</span></label>
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"><input type="checkbox" checked={filters.status.includes('outOfStock')} onChange={() => handleStatusFilterChange('outOfStock')} className="rounded text-blue-600" /><span className="text-sm text-slate-700">Out of Stock</span></label>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Price</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setFilters({...filters, priceSort: 'asc'})} className={`flex-1 py-1.5 text-xs rounded border ${filters.priceSort === 'asc' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200'}`}>Low to High</button>
                                                <button onClick={() => setFilters({...filters, priceSort: 'desc'})} className={`flex-1 py-1.5 text-xs rounded border ${filters.priceSort === 'desc' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200'}`}>High to Low</button>
                                            </div>
                                        </div>
                                        <button onClick={() => { setFilters({ categories: [], status: [], priceSort: null }); setShowFilterMenu(false); }} className="w-full text-xs text-red-600 hover:underline pt-2 border-t border-slate-100">Reset Filters</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full"><Bell className="w-5 h-5" /></button>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold"><User className="w-4 h-4" /></div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-bold text-slate-900">Products</h2>
                            <button onClick={openAddProductModal} className={primaryButtonClasses}><Plus className="w-5 h-5 mr-2" /> Add Product</button>
                        </div>

                        {/* Product Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>{['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAndSortedProducts.map(product => {
                                        const totalStock = calculateTotalStock(product);
                                        const isExpanded = expandedProductId === product.id;
                                        return (
                                            <>
                                                <tr key={product.id} className={`cursor-pointer hover:bg-slate-50 ${isExpanded ? 'bg-slate-50' : ''}`} onClick={() => toggleExpand(product.id)}>
                                                    <td className="px-6 py-4 flex items-center gap-4">
                                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                                                        {getImageUrl(product.imageUrl) ? <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><ImageIcon className="w-5 h-5" /></div>}
                                                        <div><p className="font-bold text-sm text-slate-900">{product.name}</p><p className="text-xs text-slate-500">Brand: {product.brand || 'N/A'}</p></div>
                                                    </td>
                                                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">{product.category}</span></td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{getPriceDisplay(product)}</td>
                                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${totalStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{totalStock} In Stock</span></td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={() => openEditProductModal(product)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                {/* --- VARIANT LIST --- */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/50">
                                                        <td colSpan="5" className="p-4 pl-16">
                                                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-slate-500 uppercase">Variants</span></div>
                                                                    <button onClick={() => openAddVariantModal(product.id)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition">+ Add Variant</button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {product.variants?.map(v => {
                                                                        const hasColor = v.colorName && v.colorName !== 'Standard';
                                                                        const hasStorage = v.storage && v.storage !== 'Standard';
                                                                        
                                                                        let variantHeader = "Default Variant";
                                                                        if (hasColor && hasStorage) variantHeader = `${v.colorName} + ${v.storage}`;
                                                                        else if (hasColor) variantHeader = v.colorName;
                                                                        else if (hasStorage) variantHeader = v.storage;

                                                                        const subtextParts = [];
                                                                        if (hasColor) subtextParts.push("Color");
                                                                        if (hasStorage) subtextParts.push("Storage");
                                                                        subtextParts.push(v.price ? `RM ${v.price}` : "Base Price");
                                                                        
                                                                        return (
                                                                            <div key={v.id} className="p-4 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all flex flex-col justify-between">
                                                                                <div className="flex items-start gap-3 mb-3">
                                                                                    {v.imageUrl ? (
                                                                                        <img src={getImageUrl(v.imageUrl)} className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                                                                                    ) : hasColor ? (
                                                                                        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center p-0.5 flex-shrink-0"><div className="w-full h-full rounded-full" style={{backgroundColor: v.colorHex || '#000'}}></div></div>
                                                                                    ) : (
                                                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0"><Package className="w-5 h-5" /></div>
                                                                                    )}
                                                                                    <div>
                                                                                        <p className="text-sm font-bold text-slate-900">{variantHeader}</p>
                                                                                        <p className="text-xs text-slate-500 font-medium">{subtextParts.join(" • ")}</p>
                                                                                    </div>
                                                                                    <span className="ml-auto text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 whitespace-nowrap">{v.stock} left</span>
                                                                                </div>
                                                                                <div className="flex gap-2 mt-auto">
                                                                                    <button onClick={() => openEditVariantModal(v, product.id)} className="flex-1 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Edit</button>
                                                                                    <button onClick={() => handleDeleteVariant(v.id, product.id)} className="px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- CONFIRMATION  --- */}
                {confirmModal.show && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
                                <p className="text-sm text-slate-500 mb-6">{confirmModal.message}</p>
                                <div className="flex gap-3">
                                    <button onClick={closeConfirmModal} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition" disabled={isSubmitting}>Cancel</button>
                                    <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20" disabled={isSubmitting}>{isSubmitting ? "Deleting..." : "Delete"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LOGOUT CONFIRMATION  --- */}
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

                {/* --- PRODUCT FORM  --- */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">{isEditing ? "Edit Product Details" : "Create New Product"}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>
                            <form onSubmit={handleProductSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2"><label className={labelClasses}>Product Name</label><input name="name" value={productForm.name} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="e.g. iPhone 15 Pro" required /></div>
                                <div><label className={labelClasses}>Brand</label><input name="brand" value={productForm.brand} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="e.g. Apple" required /></div>
                                <div>
                                    <label className={labelClasses}>Category</label>
                                    <input name="category" list="category-options" value={productForm.category} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="Select or Type..." required />
                                    <datalist id="category-options">{categories.map((cat, idx) => <option key={idx} value={cat} />)}</datalist>
                                </div>
                                <div><label className={labelClasses}>Base Price</label><input type="number" name="price" value={productForm.price} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="Price in RM" required /></div>
                                <div className="md:col-span-2"><label className={labelClasses}>Description</label><textarea name="description" value={productForm.description} onChange={handleProductInputChange} className={inputBaseClasses} rows="3" placeholder="Product details..." required /></div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Initial Stock (Base)</label>
                                    <input type="number" name="stock" value={productForm.stock} onChange={handleProductInputChange} className={`${inputBaseClasses} ${isEditing ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="0" required disabled={isEditing} />
                                    <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-700"><Info className="w-4 h-4 flex-shrink-0" /><p className="text-xs font-medium">{isEditing ? "To update stock, please use the Variant Manager." : "If this product has variants (like colors), leave this as 0 and add stock in the variants section later."}</p></div>
                                </div>
                                <div className="md:col-span-2"><label className={labelClasses}>Product Image</label><input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })} /></div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsProductModalOpen(false)} className={secondaryButtonClasses} disabled={isSubmitting}>Cancel</button>
                                    <button type="submit" className={primaryButtonClasses} disabled={isSubmitting}>{isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Product")}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- VARIANT  --- */}
                {isVariantModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">{variantForm.id ? "Edit Variant" : "Add New Variant"}</h3>
                                <button onClick={() => setIsVariantModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>
                            <form onSubmit={handleVariantSubmit} className="p-6 space-y-5">
                                <div><label className={labelClasses}>Variant Image (Optional)</label><input type="file" className="text-sm" onChange={e => setVariantForm({...variantForm, image: e.target.files[0]})} /></div>
                                <div className="flex gap-4 border-b border-slate-100 pb-4">
                                    <label className="flex items-center gap-2 cursor-pointer group"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${enableColor ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{enableColor && <Check className="w-3.5 h-3.5 text-white" />}</div><span className="text-sm font-semibold text-slate-700">Has Color</span><input type="checkbox" className="hidden" checked={enableColor} onChange={(e) => setEnableColor(e.target.checked)} /></label>
                                    <label className="flex items-center gap-2 cursor-pointer group"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${enableStorage ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{enableStorage && <Check className="w-3.5 h-3.5 text-white" />}</div><span className="text-sm font-semibold text-slate-700">Has Storage</span><input type="checkbox" className="hidden" checked={enableStorage} onChange={(e) => setEnableStorage(e.target.checked)} /></label>
                                </div>
                                {enableColor && <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-1"><div><label className={labelClasses}>Color Name</label><input value={variantForm.colorName} onChange={(e) => setVariantForm({...variantForm, colorName: e.target.value})} className={inputBaseClasses} placeholder="Color Name" /></div><div><label className={labelClasses}>Hex Code</label><div className="flex gap-2"><input type="color" value={variantForm.colorValue} onChange={(e) => setVariantForm({...variantForm, colorValue: e.target.value})} className="h-9 w-9 p-0 border rounded" /><input value={variantForm.colorValue} onChange={e => setVariantForm({...variantForm, colorValue: e.target.value})} className={`${inputBaseClasses} uppercase`} /></div></div></div>}
                                {enableStorage && <div className="animate-in slide-in-from-top-1"><label className={labelClasses}>Storage Capacity</label><div className="grid grid-cols-4 gap-2">{['128GB', '256GB', '512GB', '1TB'].map((size) => (<button key={size} type="button" onClick={() => setVariantForm({ ...variantForm, storage: size})} className={`py-2.5 px-2 text-xs font-bold border rounded ${variantForm.storage === size ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>{size}</button>))}</div></div>}
                                <div className="grid grid-cols-2 gap-4"><div><label className={labelClasses}>Stock</label>{variantForm.id ? <button type="button" onClick={openStockModal} className="w-full py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded border border-blue-100 hover:bg-blue-50">Manage Stock</button> : <input type="number" value={variantForm.stock} onChange={e => setVariantForm({...variantForm, stock: e.target.value})} className={inputBaseClasses} required placeholder="0" />}</div><div><label className={labelClasses}>Price (Optional)</label><input type="number" value={variantForm.price} onChange={e => setVariantForm({...variantForm, price: e.target.value})} className={inputBaseClasses} placeholder="Price in RM" /></div></div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100"><button type="button" onClick={() => setIsVariantModalOpen(false)} className={secondaryButtonClasses} disabled={isSubmitting}>Cancel</button><button type="submit" className={primaryButtonClasses} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Variant"}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- STOCK  --- */}
                {isStockModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-4">Adjust Stock</h3>
                            <div className="flex justify-around items-center mb-8"><div className="text-center"><p className="text-xs text-slate-400 font-bold">CURRENT</p><p className="text-3xl font-bold text-slate-900">{variantForm.stock}</p></div><ArrowRight className="text-slate-300" /><div className="text-center"><p className="text-xs text-blue-500 font-bold">NEW</p><p className="text-3xl font-bold text-blue-600">{Number(variantForm.stock) + stockAdjustment}</p></div></div>
                            <div className="flex gap-4 mb-6"><button onClick={() => setStockAdjustment(s => s - 1)} className="p-3 border rounded hover:bg-slate-50"><Minus /></button><input type="number" value={stockAdjustment} onChange={e => setStockAdjustment(Number(e.target.value))} className="flex-1 text-center text-xl font-bold border-b focus:outline-none" /><button onClick={() => setStockAdjustment(s => s + 1)} className="p-3 border rounded hover:bg-slate-50"><Plus /></button></div>
                            <button onClick={confirmStockUpdate} className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Confirm Update"}</button>
                            <button onClick={() => setIsStockModalOpen(false)} className="w-full mt-2 py-2 text-slate-500 text-sm font-bold hover:text-slate-700" disabled={isSubmitting}>Cancel</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageProducts;