import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useCart } from '../context/CartContext';
import { ShippingAddress } from '../types';
import Spinner from '../components/Spinner';

const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        name: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        setIsSubmitting(true);

        const trackingId = `JBK${Date.now()}`;

        try {
            await addDoc(collection(db, 'orders'), {
                shippingAddress,
                items: cartItems,
                totalAmount: subtotal,
                status: 'Pending',
                createdAt: serverTimestamp(),
                trackingId: trackingId
            });
            clearCart();
            navigate('/order-confirmation', { state: { trackingId } });
        } catch (error) {
            console.error("Error placing order: ", error);
            alert("Failed to place order. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0 && !isSubmitting) {
        return (
            <div className="text-center py-10 bg-white p-8 rounded-lg shadow-xl">
                <p className="text-gray-500 text-lg">Your cart is empty. You can't proceed to checkout.</p>
                <button onClick={() => navigate('/')} className="mt-4 inline-block bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition-colors">
                    Continue Shopping
                </button>
            </div>
        )
    }
    
    if (isSubmitting) {
        return (
            <div className="text-center py-20">
                <Spinner />
                <p className="text-xl font-semibold text-pink-600 mt-4">Placing Your Order...</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b pb-4">Shipping Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Full Name" value={shippingAddress.name} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                    <input type="text" name="addressLine1" placeholder="Address Line 1" value={shippingAddress.addressLine1} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                    <input type="text" name="city" placeholder="City" value={shippingAddress.city} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                    <input type="text" name="state" placeholder="State / Province" value={shippingAddress.state} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                    <input type="text" name="pincode" placeholder="Pincode / ZIP Code" value={shippingAddress.pincode} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                    <input type="tel" name="phone" placeholder="Phone Number" value={shippingAddress.phone} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-4 bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition-colors shadow-lg disabled:bg-pink-300">
                        {isSubmitting ? 'Placing Order...' : `Place Order (₹${subtotal.toFixed(2)})`}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b pb-4">Your Order</h2>
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                                <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;