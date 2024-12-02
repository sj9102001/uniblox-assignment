'use client';

import { useState } from 'react';
// Import UI components
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Import icons
import { StarIcon, PlusIcon, MinusIcon } from 'lucide-react';
// Import cart context
import { useCart } from './context/CartContext';
// Import product types
import { ProductDocument } from '@/models/Product';

// Define the props for the ProductGrid component
interface ProductGridProps {
  products: ProductDocument[];
}

// Define the ProductGrid component
export function ProductGrid({ products }: ProductGridProps) {
  // Get cart functions and data from context
  const { cart, addToCart, updateQuantity } = useCart();

  // Local state to manage quantities of products
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Function to handle quantity changes
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const updatedQuantity = Math.max(1, newQuantity);
    setQuantities((prev) => ({ ...prev, [productId]: updatedQuantity }));

    // If the product is in the cart, update its quantity
    if (isProductInCart(productId)) {
      updateQuantity(productId, updatedQuantity);
    }
  };

  // Function to handle adding a product to the cart
  const handleAddToCart = (product: ProductDocument) => {
    const productId = product._id.toString();
    const quantity = quantities[productId] || 1;

    addToCart({
      id: productId,
      title: product.title,
      price: product.price,
      quantity,
    });
  };

  // Check if a product is already in the cart
  const isProductInCart = (productId: string) => {
    return cart.some((item) => item.id === productId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const productId = product._id.toString();
        const quantity = quantities[productId] || 1;

        return (
          <Card key={productId} className="flex flex-col">
            <CardContent className="p-4">
              {/* Product Image */}
              <div className="aspect-square relative mb-4">
                <img
                  src={product.thumbnail || '/placeholder.jpg'} // Provide a fallback image
                  alt={product.title}
                  className="object-cover rounded-md"
                />
              </div>
              {/* Product Title and Description */}
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              {/* Price and Rating */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1">{product.rating.toFixed(1)}</span>
                </div>
              </div>
              {/* Brand and Stock */}
              <Badge variant="outline">{product.brand}</Badge>
              <p className="text-sm text-gray-600">Stock: {product.stock}</p>
            </CardContent>
            {/* Product Tags and Actions */}
            <CardFooter className="p-4 flex flex-col pt-0 mt-auto">
              {/* Product Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              {/* Add to Cart or Quantity Controls */}
              <div className="flex items-center">
                {isProductInCart(productId) ? (
                  // If product is in cart, show quantity controls
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(productId, quantity - 1)}
                      disabled={quantity <= 1} // Disable if quantity is 1
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(productId, parseInt(e.target.value) || 1)
                      }
                      className="w-16 mx-2 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(productId, quantity + 1)}
                      disabled={quantity >= product.stock} // Disable if quantity reaches stock limit
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  // If product is not in cart, show Add to Cart button
                  <Button className="w-full" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}