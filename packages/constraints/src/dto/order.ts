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
  skuId: number;
  name: string;
  spec?: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface OrderDetailData {
  orderId: number;
  orderNo: string;
  pickupCode: string;
  totalPrice: number;
  totalQuantity: number;
  diningMethod: DiningMethod;
  makingStatus: MakingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderDetailItem[];
}

export interface OrderDetailResponse {
  code: number;
  message: string;
  data: OrderDetailData;
}
