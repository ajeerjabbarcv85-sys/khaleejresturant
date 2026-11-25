import type {
  Category,
  CheckoutPayload,
  Customer,
  Feedback,
  FoodItem,
  Order,
  Reservation,
  RestaurantSettings,
  RestaurantTable,
  Coupon,
} from "@/lib/types";

export class ApiError extends Error {}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: T;
  };

  if (!response.ok || payload.success === false) {
    throw new ApiError(payload.message || "Something went wrong. Please try again.");
  }
  return (payload.data ?? payload) as T;
}

const post = <T>(url: string, body?: unknown) =>
  request<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const api = {
  getSettings: () => request<RestaurantSettings>("/api/settings"),

  listCategories: (all = false) => request<Category[]>(`/api/categories${all ? "?all=1" : ""}`),
  createCategory: (data: Partial<Category>) => post<Category>("/api/categories", data),
  updateCategory: (id: number, data: Partial<Category>) =>
    request<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<{ id: number }>(`/api/categories/${id}`, { method: "DELETE" }),

  listItems: (params: Record<string, string | number | boolean> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
    const suffix = query.toString();
    return request<FoodItem[]>(`/api/items${suffix ? `?${suffix}` : ""}`);
  },
  getItem: (id: number) => request<FoodItem>(`/api/items/${id}`),
  createItem: (data: Partial<FoodItem> & { imageData?: string }) =>
    post<FoodItem>("/api/items", data),
  updateItem: (id: number, data: Partial<FoodItem> & { imageData?: string }) =>
    request<FoodItem>(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id: number) => request<{ id: number }>(`/api/items/${id}`, { method: "DELETE" }),

  createOrder: (data: CheckoutPayload) =>
    post<{
      orderId: number;
      orderCode: string;
      total: number;
      status: string;
      orderType: string;
      address: string;
    }>("/api/orders", data),
  listOrders: (status?: string) =>
    request<Order[]>(`/api/orders${status ? `?status=${status}` : ""}`),
  updateOrder: (id: number, data: { status?: string; paymentStatus?: string; notes?: string }) =>
    request<Order>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  listReservations: (date?: string) =>
    request<Reservation[]>(`/api/reservations${date ? `?date=${date}` : ""}`),
  createReservation: (data: Partial<Reservation>) => post<Reservation>("/api/reservations", data),
  updateReservation: (
    id: number,
    data: Partial<Pick<Reservation, "status" | "date" | "time" | "guests" | "tableId">>
  ) =>
    request<Reservation>(`/api/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteReservation: (id: number) =>
    request<{ id: number }>(`/api/reservations/${id}`, { method: "DELETE" }),

  listTables: (params: { date?: string; time?: string; guests?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
    const suffix = query.toString();
    return request<RestaurantTable[]>(`/api/tables${suffix ? `?${suffix}` : ""}`);
  },
  addTable: (data: { name: string; seats: number }) => post<RestaurantTable>("/api/tables", data),
  updateTable: (data: Partial<RestaurantTable> & { id: number }) =>
    request<RestaurantTable>("/api/tables", { method: "PATCH", body: JSON.stringify(data) }),
  deleteTable: (id: number) => request<{ id: number }>(`/api/tables?id=${id}`, { method: "DELETE" }),

  listCoupons: (all = false) => request<Coupon[]>(`/api/coupons${all ? "?all=1" : ""}`),
  validateCoupon: (code: string, subtotal: number) =>
    request<{ code: string; discount: number; type: string; value: number }>(
      `/api/coupons?code=${encodeURIComponent(code)}&subtotal=${subtotal}`
    ),
  createCoupon: (data: Partial<Coupon>) => post<Coupon>("/api/coupons", data),
  toggleCoupon: (id: number, active: boolean) =>
    request<Coupon>("/api/coupons", { method: "PATCH", body: JSON.stringify({ id, active }) }),
  deleteCoupon: (id: number) => request<{ id: number }>(`/api/coupons?id=${id}`, { method: "DELETE" }),

  listCustomers: () => request<(Customer & { history?: unknown[] })[]>("/api/customers"),

  getReports: () =>
    request<{
      summary: {
        revenue: number;
        todayRevenue: number;
        totalOrders: number;
        todayOrders: number;
        averageOrder: number;
      };
      weekly: { label: string; revenue: number; orders: number }[];
      monthly: { label: string; revenue: number; orders: number }[];
      popular: { name: string; qty: number; revenue: number; imageUrl: string }[];
      statusCounts: { status: string; count: number }[];
    }>("/api/reports"),

  trackOrder: (code: string, phone: string) =>
    request<Order>(`/api/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`),

  listFeedback: (all = false) => request<Feedback[]>(`/api/feedback${all ? "?all=1" : ""}`),
  submitFeedback: (data: { name: string; rating: number; message: string }) =>
    post<Feedback>("/api/feedback", data),
  approveFeedback: (id: number, approved: boolean) =>
    request<Feedback>("/api/feedback", {
      method: "PATCH",
      body: JSON.stringify({ id, approved }),
    }),

  saveSettings: (data: Partial<RestaurantSettings>) =>
    request<RestaurantSettings>("/api/settings", { method: "PUT", body: JSON.stringify(data) }),

  login: (username: string, password: string) =>
    post<{ username: string }>("/api/auth/login", { username, password }),
  logout: () => post<{ signedOut: boolean }>("/api/auth/logout"),
  me: () => request<{ authenticated: boolean; admin: { id: number; username: string } | null }>("/api/auth/me"),

  uploadImage: (imageData: string) => post<{ url: string }>("/api/upload", { imageData }),
};
