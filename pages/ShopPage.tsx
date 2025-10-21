import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(db, 'products');
        const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
        const productSnapshot = await getDocs(q);
        const productsList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsList);
      } catch (err)
 {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-pink-100 rounded-lg shadow-lg mb-12 p-8 md:p-16 flex flex-col items-center text-center -mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
         <h1 className="text-4xl md:text-6xl font-serif font-bold text-pink-500 mb-4">Elegance Redefined</h1>
         <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-8">Discover our curated collection of anti-tarnish, water-resistant, and hypoallergenic stainless steel jewelry. Unique. As you... ✨</p>
         <button onClick={scrollToProducts} className="bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition-transform transform hover:scale-105 shadow-lg">
           Shop Now
         </button>
      </div>

      <div id="products-section" className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">Our Collection</h2>
        <p className="text-gray-500">Handpicked with love, crafted for you.</p>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;