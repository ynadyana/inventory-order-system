import { ShoppingCart, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // <--- Import

const Navbar = () => {
  const { cart } = useCart(); // <--- Get cart data

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
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Log in</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;