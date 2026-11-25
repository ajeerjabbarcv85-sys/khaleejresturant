export type ID = number | string;

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  active: boolean;
  itemCount?: number;
};

export type FoodItem = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  featured: boolean;
  available: boolean;
  veg: boolean;
  categoryName?: string;
  createdAt?: string;
};

export const ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "COD" | "UPI" | "CARD" | "NETBANKING";

export type OrderItem = {
  id?: number;
  orderId?: number;
  itemId: number;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
};

export type Order = {
  id: number;
  orderCode: string;
  customerId: number | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  orderType: "DELIVERY" | "PICKUP";
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};

export type ReservationStatus = "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED";

export type Reservation = {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  tableId: number | null;
  tableName?: string;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
};

export type RestaurantTable = {
  id: number;
  name: string;
  seats: number;
  active: boolean;
  available?: boolean;
  fitsGuests?: boolean;
};

export type Coupon = {
  id: number;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  orders: number;
  spent: number;
  createdAt: string;
};

export type Feedback = {
  id: number;
  name: string;
  rating: number;
  message: string;
  approved: boolean;
  createdAt: string;
};

export type RestaurantSettings = {
  restaurantName: string;
  logoUrl: string;
  tagline: string;
  address: string;
  mapUrl: string;
  mapEmbedUrl: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  openingHours: string;
  taxPercent: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  currency: string;
  heroTitle: string;
  heroScript: string;
  heroIntro: string;
  aboutTitle: string;
  aboutStory: string;
  chefName: string;
  chefTitle: string;
  chefBio: string;
  promoTitle: string;
  promoText: string;
  timeSlots: string[];
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type CartLine = { item: FoodItem; qty: number };

export type CheckoutPayload = {
  name: string;
  phone: string;
  email: string;
  address: string;
  orderType: "DELIVERY" | "PICKUP";
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  items: { itemId: number; qty: number }[];
};

export type PlacedOrder = {
  orderId: number;
  orderCode: string;
  total: number;
  itemName: string;
  qty: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderType: "DELIVERY" | "PICKUP";
  address: string;
};
