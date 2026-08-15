export interface ShopSeller {
  id: string;
  name: string;
  email: string;
}

export interface ShopDetails {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  sellerId: string;
  seller?: ShopSeller;
  createdAt: string;
  updatedAt: string;
}
