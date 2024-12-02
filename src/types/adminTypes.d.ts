// Item in an order
export interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
  }
  
  // Order document
  export interface OrderDocument {
    items: OrderItem[];
    subtotal: number;
    totalPrice: number;
    discountApplied: number;
    name: string;
    address: string;
    couponUsed?: string;
    usedCoupon: boolean;
    createdAt: Date;
  }
  
  // Admin stats response
  export interface AdminStats {
    totalPurchaseAmount: number;
    totalDiscountAmount: number;
    discountCodesUsed: string[];
    itemSales: ItemSales[];
  }
  
  // Item sales type
  export interface ItemSales {
    id: string;
    title: string;
    count: number;
  }