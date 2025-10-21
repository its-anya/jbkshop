import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderConfirmationPage: React.FC = () => {
    const location = useLocation();
    const trackingId = location.state?.trackingId;

    return (
        <div className="text-center py-20 bg-white p-8 rounded-lg shadow-xl">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h1>
            <p className="text-gray-600 mb-8">Your order has been placed successfully and is being processed.</p>
            {trackingId && (
                <div className="mb-8 bg-pink-100 border border-pink-300 text-pink-800 px-4 py-3 rounded-lg inline-block">
                    <p>Your Tracking ID is: <strong className="font-bold">{trackingId}</strong></p>
                    <p className="text-sm">Please save this ID to track your order status.</p>
                </div>
            )}
            <div>
                <Link to="/" className="mt-4 inline-block bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;