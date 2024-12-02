// Import the ProductGrid component to display the list of products
import { ProductDocument } from '@/models/Product';
import { ProductGrid } from './product-grid';

// Define the structure of a product
// Asynchronous function to fetch products from the API
async function getProducts(): Promise<ProductDocument[]> {
  // Fetch the products from the API endpoint
  // Use a relative URL to ensure it works in different environments
  const res = await fetch('http://localhost:3000/api/products', {
    // Set cache options if necessary (e.g., 'no-store' for fresh data)
    cache: 'no-store',
  });

  // Check if the response is not OK (status code outside the range 200-299)
  if (!res.ok) {
    // Throw an error to be caught by an error boundary or error handling
    throw new Error('Failed to fetch products');
  }

  // Parse the response as JSON and return the products data
  const data = await res.json();
  return data as ProductDocument[];
}

// Default export of the ProductsPage component
export default async function ProductsPage() {
  // Fetch the products data by calling the getProducts function
  const products = await getProducts();

  // Render the products page with a title and the ProductGrid component
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      {/* Render the ProductGrid component with the fetched products */}
      <ProductGrid products={products} />
    </div>
  );
}