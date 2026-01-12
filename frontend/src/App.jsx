import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login'; 
import Orders from './pages/Orders';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import Register from './pages/Register';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/products" element={<ManageProducts />} /> 
              <Route path="/dashboard/orders" element={<ManageOrders />} />
              <Route path="/payment" element={<Payment />} /> 
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/register" element={<Register />} />{}
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;