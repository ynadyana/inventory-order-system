import { useEffect, useState } from 'react';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView'; 
import { Loader } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); 

  useEffect(() => {
    api.get('/products')
      .then(res => {
        setProducts(res.data.content);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;

  return (
    <div className="py-6">

       <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onQuickView={() => setSelectedProduct(p)} 
            />
          ))}
       </div>

       {/* Quick View Modal */}
       {selectedProduct && (
         <QuickView 
           product={selectedProduct} 
           onClose={() => setSelectedProduct(null)} 
         />
       )}
    </div>
  );
};

export default Home;