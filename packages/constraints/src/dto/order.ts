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
