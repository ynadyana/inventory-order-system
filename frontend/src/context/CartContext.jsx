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
      const existing = prev.find(item => item.id === product.id && item.selectedVariant === product.selectedVariant);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedVariant === product.selectedVariant)
          ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
          : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    showToast(product);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, amount) } : item));
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