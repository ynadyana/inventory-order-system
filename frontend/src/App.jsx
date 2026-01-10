import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<h1 className="p-10 text-2xl">Login Page</h1>} />
            <Route path="/cart" element={<h1 className="p-10 text-2xl">Cart Page</h1>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;