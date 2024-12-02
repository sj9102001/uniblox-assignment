'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Import the cart context to manage cart items
import { useCart } from '../context/CartContext';
// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Import Checkbox component
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have a Checkbox component

// Defining the CheckoutPage component
export default function CheckoutPage() {
  // Get cart items and cart management functions from the cart context
  const { cart, updateQuantity, removeFromCart } = useCart();
  // Get the router for navigation
  const router = useRouter();
  // State variables for user input and coupons
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [coupons, setCoupons] = useState<{ code: string; discount: number }[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Calculate subtotal and total price with discount
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPrice = subtotal * (1 - appliedDiscount);

  // Fetch available coupons when component mounts
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch('/api/coupons');
        const data = await res.json();
        if (res.ok && data.coupon) {
          setCoupons([data.coupon]); // Assuming only one coupon is available globally
        }
      } catch (error) {
        console.error('Error fetching coupon:', error);
      }
    };

    fetchCoupons();
  }, []);

  // Handle quantity changes in the cart items
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  // Handle coupon selection or deselection
  const handleCouponToggle = (couponCode: string) => {
    if (selectedCoupon === couponCode) {
      // Deselect the coupon
      setSelectedCoupon('');
      setAppliedDiscount(0);
    } else {
      // Select the coupon
      setSelectedCoupon(couponCode);
      const foundCoupon = coupons.find((c) => c.code === couponCode);
      setAppliedDiscount(foundCoupon ? foundCoupon.discount : 0);
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    // Create order object
    const order = {
      items: cart,
      subtotal,
      discountApplied: appliedDiscount,
      totalPrice,
      name,
      address,
      couponUsed: selectedCoupon,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const data = await res.json();
      if (res.ok) {
        // Clear the cart
        cart.forEach((item) => removeFromCart(item.id));

        // Notify the user
        alert(
          `Order placed successfully! ${
            data.isEligibleForCoupon
              ? `You have earned a discount coupon: ${data.couponCode}`
              : ''
          }`
        );

        // Redirect to the orders page
        router.push('/orders');
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cart items */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">No Items Added</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center">
                    {/* Decrease quantity button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    {/* Quantity input */}
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 mx-2 text-center"
                    />
                    {/* Increase quantity button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    {/* Remove item button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="ml-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      X
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex-col items-start">
            {/* Order summary */}
            <div className="w-full text-right mb-4">
              <p className="font-bold">Subtotal: ${subtotal.toFixed(2)}</p>
              {appliedDiscount > 0 && (
                <p className="text-green-600">
                  Discount: -${(subtotal * appliedDiscount).toFixed(2)}
                </p>
              )}
              <p className="font-bold text-lg">Total: ${totalPrice.toFixed(2)}</p>
            </div>
            {/* Available coupons */}
            <div className="w-full">
              <h3 className="font-semibold mb-2">Available Coupons</h3>
              <div className="space-y-2">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={coupon.code}
                      checked={selectedCoupon === coupon.code}
                      onCheckedChange={() => handleCouponToggle(coupon.code)}
                    />
                    <Label htmlFor={coupon.code}>
                      {coupon.code} ({(coupon.discount   * 100).toFixed(0)}% off)
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardFooter>
        </Card>
        {/* Shipping information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Name input */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {/* Address input */}
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {/* Checkout button */}
            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !name || !address}
              className="w-full"
            >
              Confirm Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}