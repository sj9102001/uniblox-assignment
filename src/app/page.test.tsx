import { render, screen, waitFor } from '@testing-library/react';
import ProductsPage from './page'; // Import the component being tested
import '@testing-library/jest-dom'; // Extend Jest matchers with DOM-specific matchers
import fetchMock from 'jest-fetch-mock'; // Mock the fetch API for testing
import { CartProvider } from './context/CartContext'; // Import the CartProvider for context

// Enable mocking for the fetch API globally
fetchMock.enableMocks();

// Reset fetch mocks before each test to ensure a clean slate
beforeEach(() => {
  fetchMock.resetMocks();
});

// Create a mock CartProvider to wrap components during testing
const MockCartProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
};

/**
 * Test suite for the ProductsPage component
 */
describe('ProductsPage', () => {
  // Mock data to simulate the API response
  const mockProducts = [
    {
      _id: '1',
      title: 'Product 1',
      description: 'Description for product 1',
      price: 20,
      rating: 4.5,
      brand: 'Brand 1',
      stock: 10,
      tags: ['tag1', 'tag2'],
      thumbnail: '/images/product1.jpg',
    },
  ];

  /**
   * Test case: Fetches and displays products successfully
   */
  test('fetches and displays products', async () => {
    // Mock the API response with a successful list of products
    fetchMock.mockResponseOnce(JSON.stringify(mockProducts));

    // Render the ProductsPage wrapped in the MockCartProvider
    render(
      <MockCartProvider>
        <ProductsPage />
      </MockCartProvider>
    );

    // Wait for the products title to appear in the document
    await waitFor(() => expect(screen.getByText('Our Products')).toBeInTheDocument());

    // Assert that the product data is displayed correctly
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  /**
   * Test case: Displays an error message when the API request fails
   */
  test('displays error message when fetching products fails', async () => {
    // Mock a rejected API request to simulate a fetch error
    fetchMock.mockRejectOnce(new Error('Failed to fetch products'));

    // Render the ProductsPage wrapped in the MockCartProvider
    render(
      <MockCartProvider>
        <ProductsPage />
      </MockCartProvider>
    );

    // Wait for the error message to appear in the document
    await waitFor(() => {
      screen.debug(); // Log the current DOM structure for debugging purposes
      expect(screen.getByText(/Failed to fetch products/i)).toBeInTheDocument();
    });

    // Assert that the exact error message is displayed
    expect(screen.getByText('Failed to fetch products')).toBeInTheDocument();
  });
});