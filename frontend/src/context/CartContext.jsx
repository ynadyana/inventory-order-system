import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      // 1. Normalize the variant. If none selected, assume "Standard"
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
      
      // 2. Prepare item for cart with safe defaults
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
    showToast(product);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (id, variantName, amount) => {
    setCart(prev => prev.map(item => 
        (item.id === id && item.selectedVariant?.colorName === variantName) 
        ? { ...item, quantity: Math.max(1, amount) } 
        : item
    ));
  };

  const updateItemVariant = (itemId, oldVariant, newVariantObj) => {
    setCart(prev => prev.map(item => {
        if (item.id === itemId && item.selectedVariant?.colorName === oldVariant.colorName) {
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
        isCartOpen, 
        setIsCartOpen,
        clearCart, // <--- YOU MISSED THIS
        total      // <--- AND THIS
    }}>
      {children}
    </CartContext.Provider>
  );
};