export type DiningMethod = 1 | 2 | 3;
export type MakingStatus = number;
export type PaymentStatus = number;

export interface OrderWindowItem {
  orderId: number;
  orderNo: string;
  pickupCode: string;
  totalPrice: number;
  totalQuantity: number;
  diningMethod: DiningMethod;
  makingStatus: MakingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface OrderWindowData {
  items: OrderWindowItem[];
  total: number;
}

export interface OrderWindowResponse {
  code: number;
  message: string;
  data: OrderWindowData;
}

export interface OrderDetailItem {
  id: number | null;
  productId: number;
  productName: string;
  skuId: string;
  customization: string | null;
  coverUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  available: boolean;
}

export interface OrderDetailData {
  id: number;
  orderNo: string;
  tradeNo: string;
  storeId: number;
  diningMethod: DiningMethod;
  note: string | null;
  source: number;
  pickupCode: string;
  makingStatus: MakingStatus;
  paymentMethod: number;
  paymentStatus: PaymentStatus;
  paymentExpiredAt: string | null;
  paymentPaidAt: string | null;
  paymentRefundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  totalQuantity: number;
  items: OrderDetailItem[];
}

export interface OrderDetailResponse {
  code: number;
  message: string;
  data: OrderDetailData;
}
