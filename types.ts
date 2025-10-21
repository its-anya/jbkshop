import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  videoUrls?: string[];
  createdAt: Timestamp;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface ShippingAddress {
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Timestamp;
  trackingId: string;
}