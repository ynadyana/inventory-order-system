import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Trash2, Edit, Upload, X, Image as ImageIcon } from 'lucide-react';

const ManageProducts = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Are we adding or editing?
  const [currentProductId, setCurrentProductId] = useState(null); // ID of product being edited

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null 
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
      // Sort by newest ID first
      setProducts(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. OPEN MODAL (ADD MODE) ---
  const openAddModal = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '', image: null });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // --- 2. OPEN MODAL (EDIT MODE) ---
  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock, // Ensure your backend sends 'stock' now!
      category: product.category,
      image: null // We don't preload the file object, only replace if user uploads new one
    });
    setCurrentProductId(product.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  // --- 3. SUBMIT (CREATE OR UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // --- UPDATE LOGIC (PUT) ---
        // Note: Currently backend PUT only supports JSON (no image update in this step)
        const updateData = {
            sku: "SKU-" + currentProductId, // Mock SKU if needed or keep existing
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            category: formData.category,
            // Stock is handled separately in inventory usually, but let's assume basic info update
        };

        await api.put(`/products/${currentProductId}`, updateData);
        alert("Product Updated Successfully!");

      } else {
        // --- CREATE LOGIC (POST with Image) ---
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        if (formData.image) {
          data.append('image', formData.image);
        }

        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Product Created Successfully!");
      }

      setIsModalOpen(false);
      fetchProducts(); // Refresh list

    } catch (error) {
      console.error("Operation failed", error);
      alert("Failed to save product. Check console.");
    }
  };

  // --- 4. DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id)); // Remove from UI immediately
    } catch (error) {
      console.error("Delete failed", error);
      alert("Could not delete product.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const getImageUrl = (path) => path ? `http://localhost:8080/${path}` : null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white p-6 flex flex-col fixed h-full z-10">
        <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
          <LayoutDashboard /> Staff Panel
        </h1>
        <nav className="flex-1 space-y-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition text-gray-300 hover:text-white">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 bg-indigo-800 rounded-lg text-left text-white shadow-lg">
            <Package className="w-5 h-5" /> Manage Products
          </button>
          <button onClick={() => navigate('/dashboard/orders')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition text-gray-300 hover:text-white">
            <ShoppingCart className="w-5 h-5" /> Manage Orders
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100 mt-auto">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
            <button 
                onClick={openAddModal} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-md"
            >
                <Plus className="w-5 h-5" /> Add Product
            </button>
        </div>

        {/* --- Product Table --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                    <tr>
                        <th className="p-4 border-b">Image</th>
                        <th className="p-4 border-b">Product Name</th>
                        <th className="p-4 border-b">Category</th>
                        <th className="p-4 border-b">Price</th>
                        <th className="p-4 border-b">Stock</th>
                        <th className="p-4 border-b text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 border-b last:border-0">
                            <td className="p-4">
                                {getImageUrl(product.imageUrl) ? (
                                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-12 h-12 object-cover rounded-md border" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </td>
                            <td className="p-4 font-medium text-gray-900">{product.name}</td>
                            <td className="p-4 text-sm text-gray-500">{product.category}</td>
                            <td className="p-4 font-bold text-gray-700">
                                RM {(product.price || 0).toLocaleString()}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                </span>
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                                <button 
                                  onClick={() => openEditModal(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(product.id)} 
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required>
                        <option value="">Select Category</option>
                        <option value="LAPTOP">Laptop</option>
                        <option value="ACCESSORIES">Accessories</option>
                        <option value="AUDIO">Audio</option>
                        <option value="GPU">GPU</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">RM</span>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required disabled={isEditing} />
                    {isEditing && <p className="text-xs text-gray-400 mt-1">Stock management is separate</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" required />
                </div>
                
                {!isEditing && (
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:bg-gray-50 transition cursor-pointer relative">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Click to upload image</span>
                          <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                          {formData.image && <p className="mt-2 text-indigo-600 font-medium text-sm">Selected: {formData.image.name}</p>}
                      </div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">
                        Cancel
                    </button>
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold shadow-lg transition transform hover:-translate-y-0.5">
                        {isEditing ? "Update Product" : "Save Product"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;