import React, { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    orderBy,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, Order, OrderStatus } from '../types';
import Spinner from '../components/Spinner';

const OrderDetailsModal: React.FC<{ order: Order; onClose: () => void; onStatusChange: (orderId: string, status: OrderStatus) => void; }> = ({ order, onClose, onStatusChange }) => {
    const [status, setStatus] = useState<OrderStatus>(order.status);
    
    const handleSave = () => {
        onStatusChange(order.id, status);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-serif font-bold">Order Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2 text-pink-600">Shipping Address</h3>
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-pink-600">Order Summary</h3>
                        <p><strong>Tracking ID:</strong> {order.trackingId}</p>
                        <p><strong>Date:</strong> {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span className="font-bold">{order.status}</span></p>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-pink-600">Items Ordered</h3>
                    <ul className="space-y-2">
                        {order.items.map(item => (
                            <li key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-2">Update Status</h3>
                    <div className="flex items-center space-x-4">
                        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="p-2 border rounded-lg">
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Save Status</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UrlInputManager: React.FC<{
    urls: string[];
    setUrls: React.Dispatch<React.SetStateAction<string[]>>;
    label: string;
    placeholder: string;
}> = ({ urls, setUrls, label, placeholder }) => {
    
    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrlField = () => {
        setUrls([...urls, '']);
    };

    const removeUrlField = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
    };

    return (
        <div>
            <label className="block font-medium text-gray-700 mb-2">{label}</label>
            {urls.map((url, index) => (
                <div key={index} className="flex items-center mb-2">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                    {urls.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeUrlField(index)}
                            className="ml-2 bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600"
                        >
                            -
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addUrlField}
                className="bg-gray-200 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-300"
            >
                + Add URL
            </button>
        </div>
    );
};


const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [videoUrls, setVideoUrls] = useState(['']);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
        const productsCollectionRef = collection(db, 'products');
        const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
        const productSnapshot = await getDocs(q);
        const productsList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsList);
    } catch (error) {
        console.error("Error fetching products: ", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
        const ordersCollectionRef = collection(db, 'orders');
        const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
        const orderSnapshot = await getDocs(q);
        const ordersList = orderSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        setOrders(ordersList);
    } catch (error) {
        console.error("Error fetching orders: ", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab, fetchProducts, fetchOrders]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUrls(['']);
    setVideoUrls(['']);
    setEditingProduct(null);
    setIsFormVisible(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setImageUrls(product.imageUrls.length > 0 ? product.imageUrls : ['']);
    setVideoUrls(product.videoUrls && product.videoUrls.length > 0 ? product.videoUrls : ['']);
    setIsFormVisible(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteDoc(doc(db, 'products', id));
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product: ", error);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImageUrls = imageUrls.map(url => url.trim()).filter(url => url);

    if (!name || !price || !category || finalImageUrls.length === 0) {
        alert('Please fill in name, price, category and at least one image URL.');
        return;
    }

    const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrls: finalImageUrls,
        videoUrls: videoUrls.map(url => url.trim()).filter(url => url),
    };

    try {
        if (editingProduct) {
            const productRef = doc(db, 'products', editingProduct.id);
            await updateDoc(productRef, productData);
        } else {
            await addDoc(collection(db, 'products'), {
              ...productData,
              createdAt: serverTimestamp()
            });
        }
        resetForm();
        fetchProducts();
    } catch (error) {
        console.error("Error saving product: ", error);
    }
  };
  
  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
        alert('Order status updated!');
        setSelectedOrder(null);
        fetchOrders();
    } catch (error) {
        console.error("Error updating order status:", error);
        alert('Failed to update order status.');
    }
  };

  const renderProductManager = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold mb-4 sm:mb-0">Product List</h2>
        <button 
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (isFormVisible) resetForm();
          }}
          className="w-full sm:w-auto bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
          {isFormVisible ? 'Cancel' : 'Add New Product'}
        </button>
      </div>
      {isFormVisible && (
        <div className="mb-8 p-6 bg-pink-50 rounded-lg">
          <h2 className="text-2xl font-serif font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required/>
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg" />
            <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded-lg" required/>
            <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg" required/>
            
            <UrlInputManager
              urls={imageUrls}
              setUrls={setImageUrls}
              label="Image URLs"
              placeholder="https://example.com/image.jpg"
            />

            <UrlInputManager
              urls={videoUrls}
              setUrls={setVideoUrls}
              label="Video URLs (Optional)"
              placeholder="https://youtube.com/watch?v=..."
            />

            <div className="flex space-x-4">
              <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">{editingProduct ? 'Update' : 'Save'}</button>
              <button type="button" onClick={resetForm} className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Reset</button>
            </div>
          </form>
        </div>
      )}
      {/* Responsive Product List */}
      <div className="space-y-4 md:hidden">
        {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
                <div className="font-bold text-lg">{product.name}</div>
                <div className="text-gray-600">₹{product.price.toFixed(2)}</div>
                <div className="text-sm text-gray-500">{product.category}</div>
                <div className="mt-4 flex space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-sm bg-blue-100 text-blue-600 py-1 px-3 rounded-full">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-sm bg-red-100 text-red-600 py-1 px-3 rounded-full">Delete</button>
                </div>
            </div>
        ))}
      </div>
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Price</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b">{product.name}</td>
                <td className="py-2 px-4 border-b">₹{product.price.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{product.category}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleEdit(product)} className="text-blue-500 hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderOrderManager = () => (
    <>
      <h2 className="text-2xl font-semibold mb-4">Order List</h2>
      {/* Responsive Order List */}
       <div className="space-y-4 md:hidden">
        {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold">{order.shippingAddress.name}</div>
                        <div className="text-sm text-gray-500">{order.trackingId}</div>
                    </div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</div>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <div>
                        <div className="text-gray-600">₹{order.totalAmount.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => setSelectedOrder(order)} className="text-sm bg-gray-200 py-1 px-3 rounded-full">View Details</button>
                </div>
            </div>
        ))}
       </div>
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Tracking ID</th>
              <th className="py-2 px-4 border-b text-left">Customer</th>
              <th className="py-2 px-4 border-b text-left">Total</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td className="py-2 px-4 border-b">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{order.trackingId}</td>
                <td className="py-2 px-4 border-b">{order.shippingAddress.name}</td>
                <td className="py-2 px-4 border-b">₹{order.totalAmount.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{order.status}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:underline">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl">
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Panel</h1>
      </div>
      
      <div className="flex space-x-1 sm:space-x-4 border-b mb-6">
        <button onClick={() => setActiveTab('products')} className={`py-2 px-2 sm:px-4 font-semibold text-sm sm:text-base ${activeTab === 'products' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500'}`}>
          Manage Products
        </button>
        <button onClick={() => setActiveTab('orders')} className={`py-2 px-2 sm:px-4 font-semibold text-sm sm:text-base ${activeTab === 'orders' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500'}`}>
          View Orders
        </button>
      </div>

      {loading ? <Spinner /> : (
          activeTab === 'products' ? renderProductManager() : renderOrderManager()
      )}
    </div>
  );
};

export default AdminPage;