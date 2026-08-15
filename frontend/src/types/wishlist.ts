import { Product } from "./product";

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface Wishlist {
  id: string | null;
  items: WishlistItem[];
}

export interface WishlistCheckResponse {
  isWishlisted: boolean;
}
