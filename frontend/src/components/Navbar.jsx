import { ShoppingCart, Package, LogOut, User, ClipboardList } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out successfully");
    navigate("/login");
    window.location.reload(); 
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TechVault</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/cart" className="relative group">
              <ShoppingCart className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <>
                <Link 
                  to="/orders" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <ClipboardList className="w-4 h-4" /> My Orders
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <User className="w-4 h-4" /> Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;