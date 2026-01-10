import { useEffect, useState } from 'react';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';
import { Loader } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/products')
       .then(res => {
         setProducts(res.data.content);
         setLoading(false);
       })
       .catch(err => {
         console.error(err);
         setError("Could not load products. Is Backend running?");
         setLoading(false);
       });
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin text-blue-600 w-10 h-10" /></div>;
  if (error) return <div className="text-center text-red-600 p-20 font-bold text-xl">{error}</div>;

  return (
    <div>
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Latest Arrivals</h1>
          <p className="text-gray-500">Upgrade your setup with premium gear.</p>
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         {products.map(p => <ProductCard key={p.id} product={p} />)}
       </div>
    </div>
  );
};
export default Home;