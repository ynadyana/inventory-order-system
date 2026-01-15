import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext'; 
import Navbar from './components/Navbar';
import TopBar from './components/TopBar'; 
import Footer from './components/Footer'; 
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage'; 
import CartSidebar from './components/CartSidebar'; 
import WishlistSidebar from './components/WishlistSidebar';
import Cart from './pages/Cart';
import Login from './pages/Login'; 
import Orders from './pages/Orders';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails'; 
import Wishlist from './pages/Wishlist'; 
import Toast from './components/Toast'; 

const CustomerLayout = () => {
  const location = useLocation(); 
  
  // Logic to identify authentication pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Show TopBar only on Home and if not auth page */}
      {!isAuthPage && location.pathname === '/' && <TopBar />}
      
      {/* Navbar  visibility via */}
      <Navbar />
      
      <CartSidebar />
      <WishlistSidebar />
      <Toast />
      
      <main className={`flex-1 mx-auto ${isAuthPage ? 'w-full' : 'max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>

      {/* Hide Footer on Auth Pages */}
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Toast /> 
            <Routes>
              {/* --- ADMIN ROUTES --- */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/products" element={<ManageProducts />} />
              <Route path="/dashboard/orders" element={<ManageOrders />} />

              {/* --- CUSTOMER ROUTES --- */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductsPage />} /> 
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/payment" element={<Payment />} /> 
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;