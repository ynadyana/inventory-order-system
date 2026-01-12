import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toastData, setToastData] = useState(null); // Stores product object

  const showToast = (product) => {
    setToastData(product);
    
    // Auto-hide after 5 seconds (optional, users might want time to click)
    setTimeout(() => {
      setToastData(null);
    }, 5000);
  };

  const hideToast = () => setToastData(null);

  return (
    <ToastContext.Provider value={{ toastData, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};