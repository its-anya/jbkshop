import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';

const getEmbedUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        let videoId = null;
        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.substring(1);
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (error) {
        console.error("Invalid URL for embedding:", url, error);
    }
    return url; // Fallback for other video types or direct links
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const nextImage = () => {
    if (product) {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.imageUrls.length);
    }
  };

  useEffect(() => {
    if (product && product.imageUrls.length > 1) {
        intervalRef.current = window.setInterval(() => {
            nextImage();
        }, 4000); // Change image every 4 seconds
    }
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const prevImage = () => {
      if (product) {
          setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.imageUrls.length) % product.imageUrls.length);
      }
  };
  
  const resetInterval = () => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    if (product && product.imageUrls.length > 1) {
       intervalRef.current = window.setInterval(() => {
            nextImage();
        }, 4000);
    }
  }
  
  const manualPrevImage = () => {
      prevImage();
      resetInterval();
  }
  
  const manualNextImage = () => {
      nextImage();
      resetInterval();
  }
  
  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    resetInterval();
  }


  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-500">Product not found.</p>;

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl">
       {showNotification && (
        <div className="fixed top-24 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce z-50">
          Item added to cart!
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          {/* Image Slider */}
          <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4 shadow-md">
             <img src={product.imageUrls[currentImageIndex]} alt={`${product.name} slide ${currentImageIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-500" />
             {product.imageUrls.length > 1 && (
                 <>
                    <button onClick={manualPrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-colors focus:outline-none">
                        &#10094;
                    </button>
                    <button onClick={manualNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-colors focus:outline-none">
                        &#10095;
                    </button>
                 </>
             )}
          </div>
          <div className="flex justify-center space-x-3">
            {product.imageUrls.map((_, index) => (
              <button key={index} onClick={() => selectImage(index)} className={`w-3 h-3 rounded-full transition-colors ${currentImageIndex === index ? 'bg-pink-500' : 'bg-gray-300 hover:bg-gray-400'}`}></button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">{product.name}</h1>
           <p className="text-sm text-gray-500 mb-4">{product.category}</p>
          <p className="text-3xl font-semibold text-pink-500 my-4">₹{product.price.toFixed(2)}</p>
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          <button 
            onClick={handleAddToCart}
            className="w-full bg-pink-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-pink-600 transition-colors duration-300 shadow-lg transform hover:scale-105">
            Add to Cart
          </button>
        </div>
      </div>
      
       {/* Videos Section */}
       {product.videoUrls && product.videoUrls.filter(u => u).length > 0 && (
          <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 text-center">Product Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.videoUrls.map((url, index) => {
                      if(!url) return null;
                      const embedUrl = getEmbedUrl(url);
                      return embedUrl ? (
                           <div key={index} className="aspect-video">
                               <iframe
                                  src={embedUrl}
                                  title={`Product Video ${index + 1}`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full rounded-lg shadow-md"
                              ></iframe>
                           </div>
                      ) : null;
                  })}
              </div>
          </div>
       )}
    </div>
  );
};

export default ProductDetailPage;