'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the structure of a cart item
interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

// Define the shape of the cart context
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

// Create the cart context with an undefined default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component to provide cart state and actions to its children
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize cart state to an empty array
  const [cart, setCart] = useState<CartItem[]>([]);

  // Effect to load cart from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
  }, []);

  // Effect to sync cart state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Function to add a product to the cart
  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      // Check if the product already exists in the cart
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // If it exists, update the quantity
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      // If it's a new item, add it to the cart
      return [...prevCart, product];
    });
  };

  // Function to remove a product from the cart
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Function to update the quantity of a product in the cart
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove the item if the quantity is zero or negative
      removeFromCart(id);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  return (
    // Provide the cart state and actions to descendant components
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};