import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Order, OrderStatus } from '../types';
import Spinner from '../components/Spinner';

const TrackOrderPage: React.FC = () => {
    const [trackingId, setTrackingId] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId.trim()) {
            setError('Please enter a tracking ID.');
            return;
        }
        setLoading(true);
        setError(null);
        setOrder(null);
        setSearched(true);

        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('trackingId', '==', trackingId.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('No order found with this tracking ID. Please check the ID and try again.');
            } else {
                const orderData = querySnapshot.docs[0].data() as Order;
                orderData.id = querySnapshot.docs[0].id;
                setOrder(orderData);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching your order. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    const getStatusStep = (status: OrderStatus) => {
        const steps: OrderStatus[] = ['Pending', 'Shipped', 'Delivered'];
        const currentIndex = steps.indexOf(status);
        if (status === 'Cancelled') return -1;
        return currentIndex;
    }

    const OrderStatusTimeline: React.FC<{ status: OrderStatus }> = ({ status }) => {
        const steps: OrderStatus[] = ['Pending', 'Shipped', 'Delivered'];
        const currentStep = getStatusStep(status);
        
        if (status === 'Cancelled') {
            return <p className="text-center font-bold text-red-500">This order has been cancelled.</p>
        }

        return (
            <div className="flex justify-between items-center my-8">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${index <= currentStep ? 'bg-green-500' : 'bg-gray-300'}`}>
                                &#10003;
                            </div>
                            <p className={`mt-2 font-semibold ${index <= currentStep ? 'text-green-600' : 'text-gray-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Track Your Order</h1>
            <p className="text-center text-gray-600 mb-6">Enter the tracking ID sent to you on the order confirmation page.</p>
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter your tracking ID (e.g., JBK...)"
                    className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
                <button type="submit" disabled={loading} className="bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors disabled:bg-pink-300">
                    {loading ? 'Searching...' : 'Track'}
                </button>
            </form>

            <div className="mt-8">
                {loading && <Spinner />}
                {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
                {order ? (
                    <div className="border-t pt-6">
                         <h2 className="text-2xl font-semibold mb-4 text-center">Order Status</h2>
                         <OrderStatusTimeline status={order.status} />
                         <div className="mt-6 bg-pink-50 p-4 rounded-lg">
                            <p><strong>Tracking ID:</strong> {order.trackingId}</p>
                            <p><strong>Order Date:</strong> {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                            <p><strong>Recipient:</strong> {order.shippingAddress.name}</p>
                            <p><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                         </div>
                    </div>
                ) : (
                    searched && !loading && !error && <p className="text-center text-gray-500">No order details to display.</p>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
