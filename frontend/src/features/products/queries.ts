import { useQuery } from "@tanstack/react-query";
import {
  getCategoriesApi,
  getCategoryByIdApi,
  getProductsApi,
  getProductByIdApi,
  getShopByIdApi,
  searchProductsApi,
} from "./api";
import { Category } from "@/types/category";
import { Product, ProductQueryParams, ProductSearchResponse } from "@/types/product";
import { ShopDetails } from "@/types/shop";

export const CATEGORIES_QUERY_KEY = ["categories"];
export const CATEGORY_DETAILS_QUERY_KEY = (id: string) => ["categories", id];
export const PRODUCTS_QUERY_KEY = ["products"];
export const PRODUCT_DETAILS_QUERY_KEY = (id: string) => ["products", id];
export const SHOP_DETAILS_QUERY_KEY = (id: string) => ["shops", id];
export const PRODUCT_SEARCH_QUERY_KEY = (params?: ProductQueryParams) => [
  "products",
  "search",
  params,
];

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategoriesApi,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategoryDetails(id: string) {
  return useQuery<Category>({
    queryKey: CATEGORY_DETAILS_QUERY_KEY(id),
    queryFn: () => getCategoryByIdApi(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProductsApi,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductDetails(id: string) {
  return useQuery<Product>({
    queryKey: PRODUCT_DETAILS_QUERY_KEY(id),
    queryFn: () => getProductByIdApi(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useShopDetails(id: string) {
  return useQuery<ShopDetails>({
    queryKey: SHOP_DETAILS_QUERY_KEY(id),
    queryFn: () => getShopByIdApi(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useProductSearch(params?: ProductQueryParams) {
  return useQuery<ProductSearchResponse>({
    queryKey: PRODUCT_SEARCH_QUERY_KEY(params),
    queryFn: () => searchProductsApi(params),
    staleTime: 1000 * 60 * 3,
    placeholderData: (previousData) => previousData,
  });
}
