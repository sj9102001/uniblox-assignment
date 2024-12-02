import { render, screen, waitFor } from '@testing-library/react';
import OrdersPage from './page'; // Adjust the import path to the OrdersPage component
import '@testing-library/jest-dom'; // For DOM-specific matchers like `toBeInTheDocument`
import fetchMock from 'jest-fetch-mock'; // Mock fetch API for testing

// Enable fetch mocking globally
fetchMock.enableMocks();

// Reset mocks before each test to ensure clean state
beforeEach(() => {
  fetchMock.resetMocks();
});

/**
 * Test suite for the OrdersPage component
 */
describe('OrdersPage', () => {
  /**
   * Test case: Renders a loading spinner while orders are being fetched
   */
  test('renders a loading spinner while loading orders', () => {
    // Mock an unresolved promise to simulate loading state
    fetchMock.mockResponse(() => new Promise(() => {}));

    render(<OrdersPage />);

    // Check for the presence of a loading spinner using a class or test ID
    expect(document.querySelector('.loading-test')).toBeInTheDocument();
  });

  /**
   * Test case: Displays an error message when fetching orders fails
   */
  test('renders error message if fetching orders fails', async () => {
    // Mock a fetch rejection to simulate a failed API call
    fetchMock.mockReject(new Error('Failed to fetch orders'));

    render(<OrdersPage />);

    // Wait for the error message to be rendered
    await waitFor(() => expect(screen.getByText(/Failed to fetch orders/i)).toBeInTheDocument());

    // Assert that the error message is displayed
    expect(screen.getByText('Failed to fetch orders')).toBeInTheDocument();
  });

  /**
   * Test case: Displays a message when there are no orders
   */
  test('displays a message when there are no orders', async () => {
    // Mock an API response with an empty array (no orders)
    fetchMock.mockResponseOnce(JSON.stringify([]));

    render(<OrdersPage />);

    // Wait for the "no orders" message to appear
    await waitFor(() =>
      expect(screen.getByText(/you haven't placed any orders yet/i)).toBeInTheDocument()
    );
  });

  /**
   * Test case: Renders a list of orders when data is available
   */
  test('renders a list of orders when data is available', async () => {
    // Mock order data to simulate API response
    const mockOrders = [
      {
        createdAt: '2024-01-01T12:00:00Z',
        name: 'Test Name',
        address: 'Test Address',
        totalPrice: 45.67,
        items: [
          { id: '1', title: 'Item 1', price: 10.0, quantity: 2 },
          { id: '2', title: 'Item 2', price: 5.0, quantity: 3 },
        ],
      },
    ];

    // Mock the API response with the order data
    fetchMock.mockResponseOnce(JSON.stringify(mockOrders));

    render(<OrdersPage />);

    // Wait for the order list to be rendered
    await waitFor(() =>
      expect(screen.getByText(/order placed on/i)).toBeInTheDocument()
    );

    // Assert that the order details are displayed correctly
    expect(screen.getByText(/Test Name/i)).toBeInTheDocument(); // Customer name
    expect(screen.getByText(/Test Address/i)).toBeInTheDocument(); // Customer address
    expect(screen.getByText(/\$45.67/i)).toBeInTheDocument(); // Total price
    expect(screen.getByText(/Item 1 - Quantity: 2 - \$20.00/i)).toBeInTheDocument(); // First item details
    expect(screen.getByText(/Item 2 - Quantity: 3 - \$15.00/i)).toBeInTheDocument(); // Second item details
  });
});