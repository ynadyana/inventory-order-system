import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 1. Initialize Cart from LocalStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const toast = useToast();
  const showToast = toast ? toast.showToast : () => {};

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- HELPER: Generate Unique ID ---
  const generateCartItemId = (product, variant) => {
    const varId = variant?.id || 'std';
    const color = variant?.colorName || 'no-color';
    const storage = variant?.storage || 'no-storage';
    // Create a unique string like "101-25-Midnight-512GB"
    return `${product.id}-${varId}-${color}-${storage}`; 
  };

  // --- ACTIONS ---

  const addToCart = (product) => {
    setCart((prev) => {
      const selectedVar = product.selectedVariant || { colorName: "Standard" };
      const uniqueId = generateCartItemId(product, selectedVar);

      // Check if this EXACT variant is already in cart using the unique ID
      const existingItem = prev.find(item => item.cartItemId === uniqueId);

      if (existingItem) {
        return prev.map(item => 
          item.cartItemId === uniqueId 
            ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
            : item
        );
      }
      
      // New Item
      const itemToAdd = {
          ...product,
          cartItemId: uniqueId, 
          selectedVariant: selectedVar
      };
      
      return [...prev, { ...itemToAdd, quantity: product.quantity || 1 }];
    });
    
    if(showToast) showToast(product);
  };

 
  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter(item => item.cartItemId !== cartItemId));
  };
  
 
  const updateQuantity = (cartItemId, amount) => {
    setCart(prev => prev.map(item => 
        item.cartItemId === cartItemId 
        ? { ...item, quantity: Math.max(1, amount) } 
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Total Calculation use Variant Price
  const total = cart.reduce((sum, item) => {
      const price = item.selectedVariant?.price || item.price;
      return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        isCartOpen, 
        setIsCartOpen,
        clearCart, 
        total
    }}>
      {children}
    </CartContext.Provider>
  );
};