export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export type PaymentMethod = "card" | "cash";

export interface CheckoutDTO {
  items: CartItem[];
  address: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
  captchaToken: string; // "я не робот"
}