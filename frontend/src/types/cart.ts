import { ProductImage } from "./product";

export interface CartItemProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images?: ProductImage[];
}

export interface CartItemVariant {
  id: string;
  name?: string;
  price?: number | null;
  stock: number;
  isActive?: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: CartItemProduct;
  variant?: CartItemVariant | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface AddCartItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
