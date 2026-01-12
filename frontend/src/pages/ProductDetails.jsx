import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, ChevronDown, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('returns'); // For the accordion

  // 1. Fetch Product Data
  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        // Default to the first in-stock variant if available
        const firstInStock = (data.variants || []).find(v => v.stock > 0);
        if (firstInStock) setSelectedVariant(firstInStock);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load product", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  // 2. Logic Helpers
  const variants = product.variants || product.colors || [];
  
  // Determine current stock based on selection OR total product stock
  const currentStock = selectedVariant 
    ? selectedVariant.stock 
    : (variants.length > 0 ? 0 : (product.totalStock || product.stock));

  const isOutOfStock = currentStock <= 0;
  
  // Image to display
  const currentImage = selectedVariant?.imageUrl || product.imageUrl;

  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    return path.startsWith('http') ? path : `http://localhost:8080/${path}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black mb-8 flex items-center gap-2">
        ← Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* --- LEFT: IMAGES --- */}
        <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center">
          <img 
            src={getFullUrl(currentImage)} 
            alt={product.name} 
            className={`w-full max-w-md object-contain mix-blend-multiply transition-all duration-500 ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}
          />
        </div>

        {/* --- RIGHT: DETAILS --- */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">{product.category}</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-3xl font-bold text-gray-900">RM{product.price.toLocaleString()}</span>
            {currentStock < 5 && currentStock > 0 && (
              <span className="text-red-500 text-sm font-bold mb-1">Only {currentStock} left!</span>
            )}
          </div>

          {/* VARIANT SELECTOR */}
          {variants.length > 0 && (
            <div className="mb-8">
              <span className="text-sm font-bold text-gray-900 block mb-3">
                Color: <span className="text-gray-500 font-normal">{selectedVariant?.colorName || 'Select'}</span>
              </span>
              
              <div className="flex gap-3">
                {variants.map((variant, index) => {
                  const variantStock = variant.stock;
                  const isVariantSoldOut = variantStock <= 0;
                  const isSelected = selectedVariant === variant;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={false} 
                      title={`${variant.colorName} (${variantStock} stock)`}
                      className={`
                        relative w-10 h-10 rounded-full border-2 transition-all duration-200
                        ${isSelected ? 'border-black ring-1 ring-black scale-110' : 'border-gray-200 hover:border-gray-400'}
                      `}
                      // 3. VISUAL STRIKETHROUGH LOGIC
                      style={{ 
                        backgroundColor: variant.colorHex,
                        // If sold out, draw a diagonal line using CSS gradient
                        backgroundImage: isVariantSoldOut 
                          ? `linear-gradient(to top right, transparent 48%, #ff0000 48%, #ff0000 52%, transparent 52%)` 
                          : 'none',
                        // If sold out and light color
                        opacity: isVariantSoldOut ? 0.8 : 1
                      }}
                    >
                      {/* Optional: Add a standard HTML strikethrough effect if CSS gradient isn't enough */}
                      {isVariantSoldOut && (
                         <div className="absolute inset-0 bg-white/30 rounded-full" /> 
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="prose prose-sm text-gray-600 mb-8">
            <p>{product.description}</p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 mb-10 border-b border-gray-100 pb-10">
            <div className={`flex items-center border border-gray-300 rounded-full px-4 h-12 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={18}/></button>
              <span className="w-12 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(currentStock, qty + 1))}><Plus size={18}/></button>
            </div>

            <button 
              onClick={() => addToCart({ ...product, quantity: qty, selectedVariant })}
              disabled={isOutOfStock}
              className={`flex-1 rounded-full font-bold flex items-center justify-center gap-2 h-12 transition-all
                ${isOutOfStock 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              {isOutOfStock ? "SOLD OUT" : "ADD TO CART"} <ShoppingCart size={20} />
            </button>

            <button className="h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50">
              <Heart size={20} />
            </button>
          </div>

          {/* RETURNS INFO (Static) */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => setActiveTab(activeTab === 'returns' ? '' : 'returns')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 font-bold text-gray-900">
                  <RotateCcw size={20} className="text-gray-500" />
                  Return Policy
                </div>
                <ChevronDown size={16} className={`transform transition-transform ${activeTab === 'returns' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeTab === 'returns' && (
                <div className="p-4 text-sm text-gray-600 bg-white leading-relaxed">
                  <p className="mb-2">We offer a simplified return process for your convenience:</p>
                  <ul className="list-disc pl-5 space-y-1">
                     <li>You may return items directly at our physical store within <strong>30 days</strong> of purchase.</li>
                     <li>Items must be unworn, unwashed, and in original packaging with tags attached.</li>
                     <li>Please bring your digital receipt or order confirmation email.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;