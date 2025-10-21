import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 border-b pb-4">Your Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-4">Your cart is feeling a little empty.</p>
            <Link to="/" className="inline-block bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
                Discover Our Collection
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-1/2">
                  <img src={item.imageUrls[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg mr-4" />
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-20 text-center border rounded-md p-2"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <p className="font-semibold w-24 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors" aria-label={`Remove ${item.name} from cart`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-pink-50 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
                <div className="flex justify-between mb-6">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-lg">₹{subtotal.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="w-full text-center block bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
                  Proceed to Checkout
                </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;