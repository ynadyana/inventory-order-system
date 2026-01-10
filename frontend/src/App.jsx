import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // <--- IMPORT THIS
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart'; // We will create this in Step 4

function App() {
  return (
    <CartProvider> {/* <--- WRAP EVERYTHING */}
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<h1 className="p-10 text-2xl">Login Page</h1>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;