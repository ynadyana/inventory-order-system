import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Trash2, Edit, 
    X, Image as ImageIcon, Search, Filter, User, ChevronDown, Layers, 
    AlertTriangle, CheckCircle, XCircle, Check, ArrowRight, Minus, Upload
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
        id: null, 
        colorName: '', 
        colorValue: '#000000', 
        storage: '', 
        price: '', 
        stock: 0, 
        sku: '', 
        image: null, 
        album: [], 
        existingAlbum: [] 
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
        setVariantForm({ id: null, colorName: '', colorValue: '#000000', storage: '', price: '', stock: 0, sku: '', image: null, album: [], existingAlbum: [] });
        setEnableColor(false); setEnableStorage(false); setIsVariantModalOpen(true);
    };

    const openEditVariantModal = (variant, productId) => {
        setCurrentProductId(productId);
        const safeColor = variant.colorName === "Standard" ? "" : (variant.colorName || "");
        const safeStorage = variant.storage === "Standard" ? "" : (variant.storage || "");
        
        setVariantForm({ 
            id: variant.id, 
            colorName: safeColor, 
            colorValue: variant.colorHex || '#000000', 
            storage: safeStorage, 
            price: variant.price || '', 
            stock: variant.stock, 
            sku: variant.sku || '', 
            image: null,
            album: [], 
            existingAlbum: variant.albumImages || [] 
        });
        setEnableColor(!!safeColor); 
        setEnableStorage(!!safeStorage); 
        setIsVariantModalOpen(true);
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
                sku: variantForm.sku,
                albumImages: variantForm.existingAlbum 
            };
            
            const formData = new FormData();
            formData.append('data', new Blob([JSON.stringify(variantData)], { type: 'application/json' }));
            
            if (variantForm.image) formData.append('image', variantForm.image);
            
            if (variantForm.album && variantForm.album.length > 0) {
                Array.from(variantForm.album).forEach(file => {
                    formData.append('albumImages', file);
                });
            }

            if (variantForm.id) { 
                await api.put(`/variants/${variantForm.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
            } else { 
                await api.post(`/products/${currentProductId}/variants`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
            }
            
            showNotification('success', "Variant saved successfully!");
            setIsVariantModalOpen(false);
            fetchProducts(); 
        } catch (error) { 
            console.error(error);
            showNotification('error', "Failed to save variant."); 
        } finally { 
            setIsSubmitting(false); 
        }
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
            show: true, title: "Delete Product?", message: "This will permanently delete the product and all its variants.",
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
            show: true, title: "Delete Variant?", message: "Are you sure you want to delete this variant?",
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

    const handleProductInputChange = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });
    const handleLogout = () => setShowLogoutConfirm(true); 
    const confirmLogout = () => { localStorage.clear(); navigate('/login'); window.location.reload(); };
    const openStockModal = () => { setStockAdjustment(0); setIsStockModalOpen(true); };

    // Styles
    const inputBaseClasses = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide";
    const primaryButtonClasses = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
    const secondaryButtonClasses = "px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors active:scale-[0.98]";

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
                    <div><h1 className="text-lg font-bold text-slate-900 leading-tight">TechVault</h1><p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Staff Workspace</p></div>
                </div>
                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase px-4 mb-2 tracking-wider">Main Menu</div>
                    <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"><LayoutDashboard className="w-5 h-5 text-slate-400" />Overview</button>
                    <button onClick={() => navigate('/dashboard/products')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium"><Package className="w-5 h-5 text-blue-600" />Products</button>
                    <button onClick={() => navigate('/dashboard/orders')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"><ShoppingCart className="w-5 h-5 text-slate-400" />Orders</button>
                </nav>
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"><LogOut className="w-4 h-4" /><span>Sign Out</span></button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2 rounded-lg border transition ${showFilterMenu || filters.categories.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Filter className="w-4 h-4" /></button>
                            {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in zoom-in-95">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Category</p>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                                {categories.map(cat => (
                                                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition">
                                                        <input type="checkbox" checked={filters.categories.includes(cat)} onChange={() => handleCategoryFilterChange(cat)} className="rounded text-blue-600 focus:ring-blue-500" />
                                                        <span className="text-sm text-slate-700">{cat}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Status</p>
                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition"><input type="checkbox" checked={filters.status.includes('inStock')} onChange={() => handleStatusFilterChange('inStock')} className="rounded text-blue-600" /><span className="text-sm text-slate-700">In Stock</span></label>
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition"><input type="checkbox" checked={filters.status.includes('lowStock')} onChange={() => handleStatusFilterChange('lowStock')} className="rounded text-blue-600" /><span className="text-sm text-slate-700">Low Stock (≤ 3)</span></label>
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition"><input type="checkbox" checked={filters.status.includes('outOfStock')} onChange={() => handleStatusFilterChange('outOfStock')} className="rounded text-blue-600" /><span className="text-sm text-slate-700">Out of Stock</span></label>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Price</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setFilters({...filters, priceSort: 'asc'})} className={`flex-1 py-1.5 text-xs rounded border transition ${filters.priceSort === 'asc' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Low to High</button>
                                                <button onClick={() => setFilters({...filters, priceSort: 'desc'})} className={`flex-1 py-1.5 text-xs rounded border transition ${filters.priceSort === 'desc' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>High to Low</button>
                                            </div>
                                        </div>
                                        <button onClick={() => { setFilters({ categories: [], status: [], priceSort: null }); setShowFilterMenu(false); }} className="w-full text-xs text-red-600 hover:text-red-700 font-bold hover:underline pt-2 border-t border-slate-100">Reset Filters</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block"><p className="text-sm font-semibold text-slate-700 leading-none">Staff User</p><p className="text-xs text-slate-500 mt-1">Staff</p></div>
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200"><User className="w-4 h-4" /></div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6 pb-10">
                        <div className="flex justify-between items-end">
                            <div><h2 className="text-2xl font-bold text-slate-900">Product Management</h2><p className="text-sm text-slate-500 mt-1">Add, edit or remove products and variants.</p></div>
                            <button onClick={openAddProductModal} className={primaryButtonClasses}><Plus className="w-4 h-4" /> Add Product</button>
                        </div>

                        {/* Product Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>{['Product', 'Category', 'Price Range', 'Total Stock', 'Actions'].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {filteredAndSortedProducts.map(product => {
                                        const totalStock = calculateTotalStock(product);
                                        const isExpanded = expandedProductId === product.id;
                                        return (
                                            <>
                                                <tr key={product.id} className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`} onClick={() => toggleExpand(product.id)}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-1 rounded-full transition-transform duration-200 ${isExpanded ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-slate-400'}`}><ChevronDown className="w-4 h-4" /></div>
                                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold border border-slate-200 overflow-hidden flex-shrink-0">
                                                                {getImageUrl(product.imageUrl) ? <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div><p className="font-bold text-slate-800">{product.name}</p><p className="text-xs text-slate-500">{product.brand || 'No Brand'}</p></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">{product.category}</span></td>
                                                    <td className="px-6 py-4 font-bold text-slate-700">{getPriceDisplay(product)}</td>
                                                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${totalStock > 0 ? (totalStock <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : 'bg-red-50 text-red-700 border-red-200'}`}>{totalStock > 0 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {totalStock} In Stock</span></td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={() => openEditProductModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                {/* --- VARIANT LIST --- */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/30">
                                                        <td colSpan="5" className="p-4 pl-20">
                                                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                                                    <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Variants</span></div>
                                                                    <button onClick={() => openAddVariantModal(product.id)} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Variant</button>
                                                                </div>
                                                                {(!product.variants || product.variants.length === 0) ? (
                                                                    <div className="text-center py-8 text-slate-400 text-sm italic">No variants added yet. Add one to manage stock.</div>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                        {product.variants.map(v => {
                                                                            const hasColor = v.colorName && v.colorName !== 'Standard';
                                                                            const hasStorage = v.storage && v.storage !== 'Standard';
                                                                            let variantHeader = "Default";
                                                                            if (hasColor && hasStorage) variantHeader = `${v.colorName} + ${v.storage}`;
                                                                            else if (hasColor) variantHeader = v.colorName;
                                                                            else if (hasStorage) variantHeader = v.storage;

                                                                            return (
                                                                                <div key={v.id} className="p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between group">
                                                                                    <div className="flex items-start gap-3 mb-3">
                                                                                        {v.imageUrl ? <img src={getImageUrl(v.imageUrl)} className="w-10 h-10 rounded-lg object-cover border border-slate-100" /> : hasColor ? <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50"><div className="w-6 h-6 rounded-full shadow-sm border border-slate-200" style={{backgroundColor: v.colorHex || '#000'}}></div></div> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Package className="w-5 h-5" /></div>}
                                                                                        <div><p className="text-sm font-bold text-slate-900">{variantHeader}</p><p className="text-xs text-slate-500 font-medium">{v.price ? `RM ${v.price.toLocaleString()}` : "Base Price"}</p></div>
                                                                                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border ${v.stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{v.stock} Left</span>
                                                                                    </div>
                                                                                    <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50">
                                                                                        <button onClick={() => openEditVariantModal(v, product.id)} className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 rounded hover:bg-blue-50 hover:text-blue-600 transition">Edit</button>
                                                                                        <button onClick={() => handleDeleteVariant(v.id, product.id)} className="px-3 py-1.5 text-xs text-red-400 bg-slate-50 rounded hover:bg-red-50 hover:text-red-600 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                    {filteredAndSortedProducts.length === 0 && <tr><td colSpan="5" className="p-12 text-center text-slate-400"><div className="flex flex-col items-center"><Package className="w-12 h-12 mb-3 opacity-10" /><p>No products found.</p></div></td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- CONFIRMATION MODAL --- */}
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

                {/* --- LOGOUT CONFIRMATION --- */}
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

                {/* --- PRODUCT FORM MODAL --- */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">{isEditing ? "Edit Product" : "Create New Product"}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 transition"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>
                            <form onSubmit={handleProductSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2"><label className={labelClasses}>Product Name</label><input name="name" value={productForm.name} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="e.g. iPhone 15 Pro" required /></div>
                                <div><label className={labelClasses}>Brand</label><input name="brand" value={productForm.brand} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="e.g. Apple" required /></div>
                                <div><label className={labelClasses}>Category</label><input name="category" list="category-options" value={productForm.category} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="Select or Type..." required /><datalist id="category-options">{categories.map((cat, idx) => <option key={idx} value={cat} />)}</datalist></div>
                                <div><label className={labelClasses}>Base Price (RM)</label><input type="number" name="price" value={productForm.price} onChange={handleProductInputChange} className={inputBaseClasses} placeholder="0.00" required /></div>
                                <div className="md:col-span-2"><label className={labelClasses}>Description</label><textarea name="description" value={productForm.description} onChange={handleProductInputChange} className={inputBaseClasses} rows="3" placeholder="Product details..." required /></div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Base Stock</label>
                                    <input type="number" name="stock" value={productForm.stock} onChange={handleProductInputChange} className={`${inputBaseClasses} ${isEditing ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`} placeholder="0" required disabled={isEditing} />
                                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {isEditing ? "Stock is managed via variants." : "Set 0 if adding variants later."}</p>
                                </div>
                                <div className="md:col-span-2"><label className={labelClasses}>Image</label><input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })} /></div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsProductModalOpen(false)} className={secondaryButtonClasses} disabled={isSubmitting}>Cancel</button>
                                    <button type="submit" className={primaryButtonClasses} disabled={isSubmitting}>{isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Product")}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- VARIANT FORM MODAL --- */}
                {isVariantModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">{variantForm.id ? "Edit Variant" : "Add New Variant"}</h3>
                                <button onClick={() => setIsVariantModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>
                            <form onSubmit={handleVariantSubmit} className="p-6 space-y-5">
                                
                                {/* 1. Main Variant Image */}
                                <div>
                                    <label className={labelClasses}>Main Image</label>
                                    <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setVariantForm({...variantForm, image: e.target.files[0]})} />
                                </div>

                                {/* 2. Gallery Images (Album) */}
                                <div>
                                    <label className={labelClasses}>Gallery Images (Album)</label>
                                    
                                    {/* EXISTING IMAGES (From Database) */}
                                    {variantForm.existingAlbum.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase">Existing Images</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {variantForm.existingAlbum.map((imgUrl, idx) => (
                                                    <div key={idx} className="relative w-16 h-16 flex-shrink-0 border rounded-lg overflow-hidden group">
                                                        <img src={getImageUrl(imgUrl)} className="w-full h-full object-cover" alt="Existing" />
                                                        {/* DELETE BUTTON */}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setVariantForm({
                                                                ...variantForm, 
                                                                existingAlbum: variantForm.existingAlbum.filter((_, i) => i !== idx)
                                                            })} 
                                                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* UPLOAD NEW IMAGES */}
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative bg-slate-50/50">
                                        <input 
                                            type="file" 
                                            multiple 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => setVariantForm({...variantForm, album: [...variantForm.album, ...Array.from(e.target.files)]})} 
                                        />
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Upload className="w-8 h-8 mb-2 text-slate-300" />
                                            <span className="text-xs font-bold">Click to upload multiple images</span>
                                        </div>
                                    </div>
                                    
                                    {/* Preview NEW Selected Album Images */}
                                    {variantForm.album.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-[10px] text-blue-500 font-bold mb-2 uppercase">New Uploads</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {variantForm.album.map((file, idx) => (
                                                    <div key={idx} className="relative w-16 h-16 flex-shrink-0 border rounded-lg overflow-hidden group border-blue-200">
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setVariantForm({...variantForm, album: variantForm.album.filter((_, i) => i !== idx)})} 
                                                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 border-b border-slate-100 pb-4">
                                    <label className="flex items-center gap-2 cursor-pointer group"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${enableColor ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{enableColor && <Check className="w-3.5 h-3.5 text-white" />}</div><span className="text-sm font-semibold text-slate-700">Color</span><input type="checkbox" className="hidden" checked={enableColor} onChange={(e) => setEnableColor(e.target.checked)} /></label>
                                    <label className="flex items-center gap-2 cursor-pointer group"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${enableStorage ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{enableStorage && <Check className="w-3.5 h-3.5 text-white" />}</div><span className="text-sm font-semibold text-slate-700">Storage</span><input type="checkbox" className="hidden" checked={enableStorage} onChange={(e) => setEnableStorage(e.target.checked)} /></label>
                                </div>
                                {enableColor && <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-1"><div><label className={labelClasses}>Color Name</label><input value={variantForm.colorName} onChange={(e) => setVariantForm({...variantForm, colorName: e.target.value})} className={inputBaseClasses} placeholder="e.g. Midnight" /></div><div><label className={labelClasses}>Color Picker</label><div className="flex gap-2"><input type="color" value={variantForm.colorValue} onChange={(e) => setVariantForm({...variantForm, colorValue: e.target.value})} className="h-9 w-9 p-0 border rounded cursor-pointer" /><input value={variantForm.colorValue} onChange={e => setVariantForm({...variantForm, colorValue: e.target.value})} className={`${inputBaseClasses} uppercase`} /></div></div></div>}
                                {enableStorage && <div className="animate-in slide-in-from-top-1"><label className={labelClasses}>Storage Capacity</label><div className="grid grid-cols-4 gap-2">{['128GB', '256GB', '512GB', '1TB'].map((size) => (<button key={size} type="button" onClick={() => setVariantForm({ ...variantForm, storage: size})} className={`py-2 px-2 text-xs font-bold border rounded transition ${variantForm.storage === size ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{size}</button>))}</div></div>}
                                <div className="grid grid-cols-2 gap-4"><div><label className={labelClasses}>Stock Quantity</label>{variantForm.id ? <button type="button" onClick={openStockModal} className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-100 hover:bg-blue-100 transition">Adjust Stock ({variantForm.stock})</button> : <input type="number" value={variantForm.stock} onChange={e => setVariantForm({...variantForm, stock: e.target.value})} className={inputBaseClasses} required placeholder="0" />}</div><div><label className={labelClasses}>Specific Price (RM)</label><input type="number" value={variantForm.price} onChange={e => setVariantForm({...variantForm, price: e.target.value})} className={inputBaseClasses} placeholder="Optional" /></div></div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100"><button type="button" onClick={() => setIsVariantModalOpen(false)} className={secondaryButtonClasses} disabled={isSubmitting}>Cancel</button><button type="submit" className={primaryButtonClasses} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Variant"}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- STOCK ADJUSTMENT MODAL  --- */}
                {isStockModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                            {/* Header */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Adjust Stock</h3>
                                <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="p-6">
                                {/* Visual Calculation */}
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Current</p>
                                        <p className="text-3xl font-extrabold text-slate-700">{variantForm.stock}</p>
                                    </div>
                                    
                                    {/* Arrow & Adjustment Indicator */}
                                    <div className="flex flex-col items-center">
                                        <ArrowRight className="text-slate-300 w-5 h-5 mb-1" />
                                        <span className={`text-xs font-bold ${stockAdjustment > 0 ? 'text-emerald-600' : stockAdjustment < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                            {stockAdjustment > 0 ? '+' : ''}{stockAdjustment}
                                        </span>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">New Total</p>
                                        <p className={`text-3xl font-extrabold ${Number(variantForm.stock) + stockAdjustment < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                            {Number(variantForm.stock) + stockAdjustment}
                                        </p>
                                    </div>
                                </div>

                                {/* Counter Control */}
                                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 border border-slate-200 mb-6">
                                    <button 
                                        onClick={() => setStockAdjustment(s => s - 1)} 
                                        className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:text-red-600 hover:border-red-100 transition active:scale-95"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    
                                    <input 
                                        type="number" 
                                        value={stockAdjustment} 
                                        onChange={e => setStockAdjustment(Number(e.target.value))} 
                                        className="flex-1 bg-transparent text-center text-2xl font-bold text-slate-800 outline-none w-20"
                                    />
                                    
                                    <button 
                                        onClick={() => setStockAdjustment(s => s + 1)} 
                                        className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-100 transition active:scale-95"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button 
                                        onClick={confirmStockUpdate} 
                                        disabled={isSubmitting || (Number(variantForm.stock) + stockAdjustment) < 0}
                                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? "Updating..." : "Confirm Adjustment"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageProducts;