import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import TrackOrderPage from './pages/TrackOrderPage';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <CartProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-pink-50 text-gray-800 font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </CartProvider>
  );
}

export default App;