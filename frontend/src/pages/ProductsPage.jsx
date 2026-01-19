import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';
import { Loader } from 'lucide-react';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get filters from URL 
  const categoryFilter = searchParams.get('category');
  const brandFilter = searchParams.get('brand');

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        let data = Array.isArray(res.data) ? res.data : (res.data.content || []);
        
        // Filter logic on the client side 
        if (categoryFilter) {
            data = data.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
        }
        if (brandFilter) {
            data = data.filter(p => p.brand?.toLowerCase() === brandFilter.toLowerCase());
        }
        
        setProducts(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [categoryFilter, brandFilter]); // Re-run when URL params change

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 capitalize">
          {categoryFilter ? `${categoryFilter} Products` : brandFilter ? `${brandFilter} Products` : 'All Products'}
      </h2>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-20">No products found matching this filter.</p>
      )}
    </div>
  );
};

export default ProductsPage;