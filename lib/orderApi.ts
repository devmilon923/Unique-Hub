import { api, ApiResponse } from "./axios";

export type DivisionType =
  | "dhaka"
  | "chittagong"
  | "rajshahi"
  | "khulna"
  | "barisal"
  | "sylhet"
  | "mymensingh"
  | "rangpur";

export const BANGLADESH_DIVISIONS: { value: DivisionType; label: string }[] = [
  { value: "dhaka", label: "Dhaka" },
  { value: "chittagong", label: "Chittagong" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "khulna", label: "Khulna" },
  { value: "barisal", label: "Barisal" },
  { value: "sylhet", label: "Sylhet" },
  { value: "mymensingh", label: "Mymensingh" },
  { value: "rangpur", label: "Rangpur" },
];

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeVariant: string; description: string }
> = {
  pending: {
    label: "Pending",
    badgeVariant: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Order received and awaiting confirmation.",
  },
  processing: {
    label: "Processing",
    badgeVariant: "bg-logistics-subtle text-logistics-subtle-text border-logistics-subtle-border",
    description: "Order confirmed and being prepared for international dispatch.",
  },
  shipped: {
    label: "Shipped",
    badgeVariant: "bg-blue-bell-100 text-blue-bell-900 border-blue-bell-300",
    description: "Package in transit with Bangladesh courier.",
  },
  delivered: {
    label: "Delivered",
    badgeVariant: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Package successfully delivered to destination.",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "bg-commerce-subtle text-commerce-subtle-text border-commerce-subtle-border",
    description: "Order has been cancelled.",
  },
  refunded: {
    label: "Refunded",
    badgeVariant: "bg-alabaster-100 text-onyx-600 border-alabaster-200",
    description: "Order payment has been refunded.",
  },
};

export type PaymentMethod = "cod" | "online";

export interface OrderUser {
  name: string;
  email?: string;
  phone: string;
  division: DivisionType;
  city: string;
  zipCode?: number;
  fullAddress: string;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  color: string;
}

export const getDeliveryFee = (
  division?: string,
  isPreOrder?: boolean
): number => {
  if (isPreOrder) return 0;
  return division?.toLowerCase() === "dhaka" ? 80 : 130;
};

export interface CreateOrderInput {
  user: OrderUser;
  item: OrderItemPayload;
  paymentMethod: PaymentMethod;
  status?: OrderStatus;
}

export interface CreateOrderResult {
  invoiceId: string;
  deliveryFee: number;
  subtotal?: number;
  totalAmount: number;
  isPreOrder?: boolean;
  payableNow?: number;
  dueOnDelivery?: number;
  fullPrice?: number;
  productName: string;
  quantity: number;
  time: string;
}

export interface OrderProductDetail {
  _id: string;
  name: string;
  salePrice: number;
  regularPrice?: number;
  featuredImage?: string;
  gallary?: string[];
  slug?: string;
  deliveryHeading?: string;
}

export interface OrderItem {
  productId: string | OrderProductDetail;
  quantity: number;
  color: string;
  _id?: string;
}

export interface OrderRecord {
  _id: string;
  user: OrderUser;
  item: OrderItem;
  deliveryFee?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  totalData: number;
  totalPage: number;
  currentPage: number;
  nextPage: number;
  prevPage: number;
}

export interface OrderListResponseData {
  orders: OrderRecord[];
  pagination: OrderPagination;
}

export interface TrackOrderResult {
  invoiceId: string;
  orderStatus: OrderStatus;
  status: OrderStatus;
  name: string;
  customerName: string;
  phone: string;
  deliveryFee?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  division: DivisionType;
  city: string;
  fullAddress: string;
  item: OrderItem;
  createdAt: string;
  updatedAt: string;
  order?: OrderRecord;
}

export interface OrderFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  division?: string;
}

export const orderApi = {
  /**
   * Create a new order (Public)
   */
  async create(payload: CreateOrderInput): Promise<CreateOrderResult> {
    const res = await api.post<ApiResponse<CreateOrderResult>>("/order", payload);
    return res.data.data;
  },

  /**
   * Track order by Invoice ID and Phone Number (Public)
   */
  async track(invoiceId: string, phone: string): Promise<TrackOrderResult> {
    const res = await api.post<ApiResponse<TrackOrderResult>>("/order/track", {
      invoiceId: invoiceId.trim(),
      phone: phone.trim(),
    });
    return res.data.data;
  },

  /**
   * Get all orders with filtering and pagination (Admin protected)
   */
  async getAll(query?: OrderFilterQuery): Promise<OrderListResponseData> {
    const res = await api.get<ApiResponse<OrderRecord[]>>("/order", {
      params: query,
    });
    // In backend handler: SendSuccess(res, 200, { message, data: result.orders, pagination: result.pagination })
    const anyData = res.data as any;
    return {
      orders: Array.isArray(anyData?.data) ? anyData.data : [],
      pagination: anyData?.pagination || {
        totalData: 0,
        totalPage: 1,
        currentPage: 1,
        nextPage: 0,
        prevPage: 0,
      },
    };
  },

  /**
   * Get single order by ID populated with product details (Admin protected)
   */
  async getById(id: string): Promise<OrderRecord> {
    const res = await api.get<ApiResponse<OrderRecord>>(
      `/order/details/${encodeURIComponent(id)}`
    );
    return res.data.data;
  },

  /**
   * Update order status (Admin protected)
   */
  async updateStatus(id: string, status: OrderStatus): Promise<OrderRecord> {
    const res = await api.patch<ApiResponse<OrderRecord>>(
      `/order/status/${encodeURIComponent(id)}`,
      { status }
    );
    return res.data.data;
  },
};
