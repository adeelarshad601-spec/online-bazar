export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductShop {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  options?: Record<string, any> | any;
  price?: number | null;
  stock: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  isActive?: boolean;
  status?: string;
  moderationFeedback?: string | null;
  createdAt: string;
  updatedAt?: string;
  shop?: ProductShop;
  category?: ProductCategory;
  categoryId?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
}

export interface ProductQueryParams {
  q?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductSearchResponse {
  products: Product[];
  pagination: PaginationMeta;
}
