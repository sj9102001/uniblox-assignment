
## Project Documentation

### Overview

This project is an eCommerce application built using:

-   **Next.js** for server-side rendering and routing.
-   **ShadCN UI** and **TailwindCSS** for styling.
-   **TypeScript** for type safety.
-   **MongoDB** for data storage.
-   **Jest** for unit testing.

### Folder Structure

#### `src/app`

-   **admin**: Contains admin-related pages and components for managing coupons, orders, and products.
-   **api**: Backend API handlers for fetching and modifying data such as products, orders, and coupons.
-   **checkout**: Contains the checkout flow implementation.
-   **context**: Houses React context for global state management, such as the cart.
-   **fonts**: Manages custom fonts.
-   **orders**: Contains the orders page for users to view their placed orders.

#### `src/components`

Contains reusable UI components.

#### `src/lib`

Utility functions and library configurations, such as MongoDB connection setup.

#### `src/models`

Schemas and models for MongoDB collections (e.g., `Product`, `Order`, `Coupon`).

#### `src/types`

Type definitions for consistent data structure across the project.

----------

### Components and Features

#### 1. **Products Page**

-   **Path**: `src/app/products`
-   Displays a grid of products fetched from `/api/products`.
-   **Key Functions**:
    -   Fetch products on mount using `useEffect`.
    -   Show loading spinner or error message during fetch states.
    -   Render a product grid using the `ProductGrid` component.

#### 2. **Product Grid**

-   **Path**: `src/app/products/product-grid.tsx`
-   Displays product cards with details like image, price, stock, and actions (add to cart, update quantity).
-   **Key Features**:
    -   Quantity control for cart items.
    -   Integration with the cart context to manage cart state.

#### 3. **Cart Context**

-   **Path**: `src/app/context/CartContext.tsx`
-   Provides a global state for managing cart items.
-   **Key Functions**:
    -   Add, update, and remove items from the cart.
    -   Persist cart state in `localStorage`.

#### 4. **Checkout Page**

-   **Path**: `src/app/checkout`
-   Allows users to complete their purchase.
-   **Key Features**:
    -   Displays cart summary and allows quantity adjustments.
    -   Fetches available coupons and applies discounts.
    -   Submits order details to `/api/orders`.

#### 5. **Orders Page**

-   **Path**: `src/app/orders`
-   Displays a user's order history fetched from `/api/orders`.
-   **Key Features**:
    -   Fetches and renders a list of orders with details (items, total price, date).
    -   Shows a loading spinner or error message during fetch states.

#### 6. **Admin Dashboard**

-   **Path**: `src/app/admin`
-   Provides insights into sales, discount codes, and product stats.
-   **Key Features**:
    -   Fetches admin stats from `/api/admin`.
    -   Generates new discount codes via `/api/admin/discount`.

----------

### API Routes

#### 1. **Products**

-   **Path**: `/api/products`
-   Handles fetching products from MongoDB.

#### 2. **Orders**

-   **Path**: `/api/orders`
-   Handles fetching and creating orders.

#### 3. **Coupons**

-   **Path**: `/api/coupons`
-   Handles fetching available coupons.

#### 4. **Admin Stats**

-   **Path**: `/api/admin`
-   Provides aggregated sales and discount stats for the admin dashboard.

#### 5. **Generate Discount Code**

-   **Path**: `/api/admin/discount`
-   Generates a new discount code.

----------

### Styling

-   The project uses **TailwindCSS** for utility-based styling.
-   **ShadCN UI** provides reusable styled components like `Card`, `Button`, and `Alert`.

----------

### Testing

-   **Jest** is used for unit testing.
-   Unit tests are located in respective component pages.