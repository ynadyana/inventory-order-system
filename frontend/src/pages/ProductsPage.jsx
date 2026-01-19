import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { 
    Loader, Grid, List, ChevronDown, ArrowUpDown, Search, 
    Star, ShoppingCart, ArrowRight, Package, X 
} from 'lucide-react';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default'); 
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState(null);

    const categoryFilter = searchParams.get('category');
    const brandFilter = searchParams.get('brand');

    // --- FETCH DATA ---
    useEffect(() => { fetchProducts(); }, [categoryFilter, brandFilter]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            let data = Array.isArray(res.data) ? res.data : (res.data.content || []);
            
            // Client-side filtering
            if (categoryFilter) data = data.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
            if (brandFilter) data = data.filter(p => p.brand?.toLowerCase() === brandFilter.toLowerCase());
            
            setProducts(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    // --- SORTING ---
    const getSortedProducts = () => {
        let sorted = [...products];
        switch (sortBy) {
            case 'price-low': return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high': return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'name-az': return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default: return sorted;
        }
    };

    const activeProducts = getSortedProducts();
    const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;
    const clearFilters = () => setSearchParams({});

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading catalog...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            
            {/* --- 1. HERO BANNER --- */}
            <div className="bg-slate-900 text-white py-12 px-6 mb-10 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        {categoryFilter ? `${categoryFilter} Collection` : 'Next-Gen Tech Store'}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mb-6">
                        Upgrade your lifestyle with the latest gadgets. From flagship smartphones to pro-level peripherals, experience innovation that defines the future.
                    </p>
                    <div className="flex gap-3">
                        {['Laptop', 'Audio', 'Accessories', 'GPU'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSearchParams({ category: cat.toLowerCase() })}
                                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition backdrop-blur-sm"
                            >
                                {cat}
                            </button>
                        ))}
                        {(categoryFilter || brandFilter) && (
                            <button onClick={clearFilters} className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-sm font-medium transition">
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative">
                
                {/* --- 2. CONTROL BAR (Sticky & Always Visible) --- */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 gap-4 sticky top-4 z-30">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="text-slate-900 font-bold">{activeProducts.length}</span> Gadgets Found
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        {/* View Toggle */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid className="w-5 h-5" /></button>
                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-5 h-5" /></button>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition min-w-[180px] justify-between text-sm font-medium text-slate-700">
                                <span className="flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-slate-400" /> {sortBy === 'default' ? 'Sort by: Default' : sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : 'Name: A-Z'}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>
                            {isSortOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95">
                                    {[{ l: 'Default', v: 'default' }, { l: 'Price: Low to High', v: 'price-low' }, { l: 'Price: High to Low', v: 'price-high' }, { l: 'Name: A-Z', v: 'name-az' }].map((opt) => (
                                        <button key={opt.v} onClick={() => { setSortBy(opt.v); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${sortBy === opt.v ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>{opt.l}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 3. PRODUCT DISPLAY --- */}
                {activeProducts.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
                        {activeProducts.map(p => (
                            viewMode === 'grid' ? (
                                // --- GRID VIEW ---
                                <ProductCard 
                                    key={p.id} 
                                    product={p} 
                                    onQuickView={() => setSelectedProduct(p)} 
                                />
                            ) : (
                                // --- LIST VIEW (Compact Row) ---
                                <div key={p.id} className="group flex flex-col md:flex-row items-center bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                                    <div className="w-full md:w-48 h-48 md:h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer" onClick={() => setSelectedProduct(p)}>
                                        {getImageUrl(p.imageUrl) ? <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full text-slate-300"><Package className="w-8 h-8" /></div>}
                                        {p.stock <= 0 && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center"><span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span></div>}
                                    </div>

                                    <div className="flex-1 px-6 py-4 md:py-0 w-full text-center md:text-left">
                                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">{p.brand} • {p.category}</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedProduct(p)}>{p.name}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{p.description}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-1">
                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                                            <span className="text-xs text-slate-400 ml-1">(24 reviews)</span>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 px-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
                                        <div className="text-2xl font-extrabold text-slate-900">RM {p.price?.toLocaleString()}</div>
                                        {p.stock > 0 ? (
                                            <button 
                                                onClick={() => setSelectedProduct(p)} 
                                                className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95 w-full md:w-auto justify-center"
                                            >
                                                <ShoppingCart className="w-4 h-4" /> Add to Cart
                                            </button>
                                        ) : (
                                            <button disabled className="bg-slate-100 text-slate-400 px-6 py-2.5 rounded-lg font-bold text-sm cursor-not-allowed w-full md:w-auto">Unavailable</button>
                                        )}
                                        <button onClick={() => setSelectedProduct(p)} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">View Details <ArrowRight className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Search className="w-16 h-16 text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No gadgets found</h3>
                        <p className="text-slate-500">Try adjusting your filters or checking back later.</p>
                        <button onClick={clearFilters} className="mt-4 text-blue-600 font-bold hover:underline">Clear all filters</button>
                    </div>
                )}
            </div>

            {/* --- 4. QUICK VIEW MODAL (Imported Component) --- */}
            {selectedProduct && (
                <QuickView 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
};

export default ProductsPage;