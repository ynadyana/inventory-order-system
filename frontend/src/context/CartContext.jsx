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
  
  // Safe toast usage (in case context is missing)
  const toast = useToast();
  const showToast = toast ? toast.showToast : () => {};

  // 2. Persist to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- ACTIONS ---

  const addToCart = (product) => {
    setCart((prev) => {
      // Normalize the variant. If none selected, assume "Standard"
      const variantName = product.selectedVariant?.colorName || "Standard"; 
      
      const existing = prev.find(item => {
         const itemVariant = item.selectedVariant?.colorName || "Standard";
         return item.id === product.id && itemVariant === variantName;
      });

      if (existing) {
        return prev.map(item => {
          const itemVariant = item.selectedVariant?.colorName || "Standard";
          if (item.id === product.id && itemVariant === variantName) {
             return { ...item, quantity: item.quantity + (product.quantity || 1) };
          }
          return item;
        });
      }
      
      // Prepare item for cart with safe defaults
      const itemToAdd = {
          ...product,
          selectedVariant: product.selectedVariant || { 
              colorName: "Standard", 
              imageUrl: product.imageUrl,
              stock: product.totalStock // fallback
          }
      };
      
      return [...prev, { ...itemToAdd, quantity: product.quantity || 1 }];
    });
    if(showToast) showToast(product);
  };

  // Removes specific variant, not just ID
  const removeFromCart = (productId, variantName = "Standard") => {
    setCart((prev) => prev.filter(item => {
        const itemVariant = item.selectedVariant?.colorName || "Standard";
        // Keep item if ID matches BUT variant is different, OR if ID doesn't match
        return !(item.id === productId && itemVariant === variantName);
    }));
  };
  
  const updateQuantity = (id, variantName, amount) => {
    setCart(prev => prev.map(item => 
        (item.id === id && (item.selectedVariant?.colorName || "Standard") === (variantName || "Standard")) 
        ? { ...item, quantity: Math.max(1, amount) } 
        : item
    ));
  };

  
  const updateItemVariant = (itemId, oldVariant, newVariantObj) => {
    setCart(prev => prev.map(item => {
        const currentVarName = item.selectedVariant?.colorName || "Standard";
        const oldVarName = oldVariant?.colorName || "Standard";

        if (item.id === itemId && currentVarName === oldVarName) {
            return { ...item, selectedVariant: newVariantObj };
        }
        return item;
    }));
  };

  // Clear cart after payment
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Calculate total automatically
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        updateItemVariant, 
        isCartOpen, 
        setIsCartOpen,
        clearCart, 
        total
    }}>
      {children}
    </CartContext.Provider>
  );
};