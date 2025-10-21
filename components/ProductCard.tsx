import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const startImageCycling = () => {
    if (product.imageUrls && product.imageUrls.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % product.imageUrls.length);
      }, 800);
    }
  };

  const stopImageCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 group"
      onMouseEnter={startImageCycling}
      onMouseLeave={stopImageCycling}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="w-full h-64 bg-gray-200 relative">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img 
              src={product.imageUrls[currentImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
           <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-1 rounded-full text-sm font-bold text-pink-600">
              ₹{product.price.toFixed(2)}
            </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-pink-500 transition-colors">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;