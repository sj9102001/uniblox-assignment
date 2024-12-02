'use client'

import Link from 'next/link'
import { ShoppingCart, Package, ChartNoAxesCombinedIcon } from 'lucide-react'
import { useCart } from '../../app/context/CartContext'

export function Header() {
  const { cart } = useCart()

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Our Store</Link>
        <nav className="flex items-center space-x-4">
          <Link href="/checkout" className="flex items-center">
            <ShoppingCart className="w-6 h-6 mr-1" />
            <span className="sr-only">Cart</span>
            {totalItems > 0 && (
              <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href="/orders" className="flex items-center">
            <Package className="w-6 h-6 mr-1" />
            <span>Orders</span>
          </Link>
          <Link href="/admin" className="flex items-center">
            <ChartNoAxesCombinedIcon className="w-6 h-6 mr-1" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}