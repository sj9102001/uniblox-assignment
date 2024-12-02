'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define the structure of an order item
interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

// Define the structure of an order
interface Order {
  items: OrderItem[];
  totalPrice: number;
  name: string;
  address: string;
  createdAt: string;
}

// Custom hook to fetch orders
function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch orders from the API
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data: Order[] = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError((error as Error).message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
}

// Component to display a loading spinner
function LoadingSpinner() {
  return (
    <div className="loading-test flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  )
}

// Component to display an error message
interface ErrorMessageProps {
  error: string;
}

function ErrorMessage({ error }: ErrorMessageProps) {
  return <p className="text-red-500">{error}</p>;
}

// Main OrdersPage component
export default function OrdersPage() {
  // Use custom hook to fetch orders
  const { orders, loading, error } = useOrders();

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        // Display message when there are no orders
        <p>You haven't placed any orders yet.</p>
      ) : (
        // Display list of orders
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.createdAt}>
              <CardHeader>
                <CardTitle>
                  Order placed on {new Date(order.createdAt).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Name:</strong> {order.name}
                </p>
                <p>
                  <strong>Address:</strong> {order.address}
                </p>
                <p>
                  <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
                </p>
                <h3 className="font-semibold mt-4 mb-2">Items:</h3>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.title} - Quantity: {item.quantity} - $
                      {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}