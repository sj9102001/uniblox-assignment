'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from './product-grid';
import { ProductDocument } from '@/models/Product';

/**
 * ProductsPage Component
 * Displays a list of products fetched from the API.
 */
export default function ProductsPage() {
  // State to hold the fetched products
  const [products, setProducts] = useState<ProductDocument[]>([]);
  // State to track loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold error messages (if any)
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches products from the API when the component mounts.
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch data from the API
        const response = await fetch('/api/products');

        // Handle non-OK HTTP responses
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        // Parse and set products data
        const data: ProductDocument[] = await response.json();
        setProducts(data);
      } catch (err: unknown) {
        // Handle and log errors
        const errorMessage = "Failed to fetch products";
        setError(errorMessage);
      } finally {
        // Ensure loading is set to false after fetching
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchProducts();
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render error state
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Render products grid
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}