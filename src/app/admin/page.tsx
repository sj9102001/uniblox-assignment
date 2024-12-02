"use client"

import { useEffect, useState } from 'react'
// Import the AdminStats type
import { AdminStats } from '@/types/adminTypes'
// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// Import icons
import { DollarSign, Package, Tag, ShoppingCart, AlertCircle } from 'lucide-react'
// Import the toast hook for notifications
import { toast } from "@/hooks/use-toast"

// Define the structure of the response from the coupon generation API
interface CouponResponse {
  message: string
  coupon: {
    code: string
    discount: number
  } | null
}

// Custom hook to fetch admin stats
function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin')
        if (!res.ok) throw new Error(`Error fetching admin stats: ${res.statusText}`)
        const data: AdminStats = await res.json()
        setStats(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

// Component to display a loading spinner
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  )
}

// Define the structure of the Error
interface ErrorCardProps {
  error: string
}

// Component to display error message
function ErrorCard({ error }: ErrorCardProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminStatsPage() {
  // Use custom hook to fetch admin stats
  const { stats, loading, error } = useAdminStats()
  // State to hold the response from the coupon generation API
  const [couponResponse, setCouponResponse] = useState<CouponResponse | null>(null)
  // State to indicate if a discount code is being generated
  const [generatingCode, setGeneratingCode] = useState(false)

  // Function to generate a discount code
  const generateDiscountCode = async () => {
    setGeneratingCode(true)
    setCouponResponse(null)
    try {
      const res = await fetch('/api/admin/discount')
      if (!res.ok) throw new Error(`Failed to generate discount code: ${res.statusText}`)
      const data: CouponResponse = await res.json()
      setCouponResponse(data)
      if (data.coupon) {
        // Show success toast notification
        toast({
          title: "Discount Code Generated",
          description: `New code: ${data.coupon.code} (${data.coupon.discount * 100}% off)`,
        })
      } else {
        // Show error toast notification
        toast({
          title: "Coupon Generation Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (err) {
      // Show error toast notification
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to generate discount code",
        variant: "destructive",
      })
    } finally {
      setGeneratingCode(false)
    }
  }

  // Render loading state
  if (loading) {
    return <LoadingSpinner />
  }

  // Render error state
  if (error) {
    return <ErrorCard error={error} />
  }

  // If stats are not available, return null
  if (!stats) return null

  // Calculate total sales from itemSales data
  const totalSales = stats.itemSales.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Purchase Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPurchaseAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        {/* Total Discount Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Amount</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDiscountAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        {/* Total Items Sold */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Discount Codes Used */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Codes Used</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.discountCodesUsed.length > 0 ? (
              <ul className="list-disc list-inside">
                {stats.discountCodesUsed.map((code, index) => (
                  <li key={index} className="text-lg">{code}</li>
                ))}
              </ul>
            ) : (
              <p className="text-lg text-muted-foreground">No discount codes used</p>
            )}
          </CardContent>
        </Card>
        {/* Items Sold */}
        <Card>
          <CardHeader>
            <CardTitle>Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.itemSales.map((item, index) => (
                <li key={item.id || index} className="flex items-center justify-between">
                  <span className="text-lg">{item.title}</span>
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{item.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sales Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sales Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {totalSales > 0 ? (
            stats.itemSales.map((item, index) => (
              <div key={item.id || index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{item.title}</span>
                  <span>{((item.count / totalSales) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(item.count / totalSales) * 100} className="h-2" />
              </div>
            ))
          ) : (
            <p>No sales data available</p>
          )}
        </CardContent>
      </Card>

      {/* Generate Discount Code */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Discount Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateDiscountCode} 
            disabled={generatingCode}
          >
            {generatingCode ? 'Generating...' : 'Generate Discount Code'}
          </Button>
          {couponResponse && (
            <div className="mt-4">
              {couponResponse.coupon ? (
                <Alert>
                  <AlertTitle>New Discount Code Generated</AlertTitle>
                  <AlertDescription>
                    Code: <span className="font-semibold">{couponResponse.coupon.code}</span><br />
                    Discount: <span className="font-semibold">{couponResponse.coupon.discount * 100}%</span>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Coupon Generation Failed</AlertTitle>
                  <AlertDescription>{couponResponse.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}