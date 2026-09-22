export interface ShopSeller {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface ShopDetails {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  pickupAddress?: string | null;
  pickupCity?: string | null;
  pickupState?: string | null;
  pickupCountry?: string | null;
  pickupPostalCode?: string | null;
  sellerId: string;
  seller?: ShopSeller;
  createdAt: string;
  updatedAt: string;
}
