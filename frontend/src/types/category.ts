export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products?: number;
  };
}
