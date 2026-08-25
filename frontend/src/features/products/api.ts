import apiClient from "@/lib/api/client";
import { Category } from "@/types/category";
import { Product, ProductQueryParams, ProductSearchResponse } from "@/types/product";
import { ShopDetails } from "@/types/shop";
import { ApiResponse } from "@/types/auth";

function normalizeProduct(p: any): Product {
  return {
    ...p,
    price: typeof p.price === "number" ? p.price : parseFloat(String(p.price || 0)),
    compareAtPrice: p.compareAtPrice
      ? typeof p.compareAtPrice === "number"
        ? p.compareAtPrice
        : parseFloat(String(p.compareAtPrice))
      : null,
    stock: typeof p.stock === "number" ? p.stock : parseInt(String(p.stock || 0), 10),
  };
}

function normalizeCategory(category: Category): Category {
  if (!category.image) return category;

  try {
    const hostname = new URL(category.image).hostname;
    if (hostname === "example.com" || hostname === "www.example.com") {
      return { ...category, image: null };
    }
  } catch {
    return { ...category, image: null };
  }

  return category;
}

export async function getCategoriesApi(): Promise<Category[]> {
  try {
    const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return (response.data.data || []).map(normalizeCategory);
  } catch (err) {
    console.warn("Failed /categories, attempting fallback /api/categories", err);
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>("/api/categories");
      return (response.data.data || []).map(normalizeCategory);
    } catch (fallbackErr) {
      console.error("Failed to fetch categories:", fallbackErr);
      return [];
    }
  }
}

export async function getCategoryByIdApi(id: string): Promise<Category> {
  try {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    if (response.data.data) return normalizeCategory(response.data.data);
  } catch (err) {
    // Fallback if full route is used
  }
  const response = await apiClient.get<ApiResponse<Category>>(`/api/categories/${id}`);
  if (!response.data.data) {
    throw new Error("Category data not found");
  }
  return normalizeCategory(response.data.data);
}

export async function getProductsApi(): Promise<Product[]> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>("/products");
    const rawProducts = response.data.data || [];
    return rawProducts.map(normalizeProduct);
  } catch (err) {
    const response = await apiClient.get<ApiResponse<any[]>>("/api/products");
    const rawProducts = response.data.data || [];
    return rawProducts.map(normalizeProduct);
  }
}

export async function getProductByIdApi(id: string): Promise<Product> {
  try {
    const response = await apiClient.get<ApiResponse<any>>(`/products/${id}`);
    if (response.data.data) return normalizeProduct(response.data.data);
  } catch (err) {
    // Fallback if full route is used
  }
  const response = await apiClient.get<ApiResponse<any>>(`/api/products/${id}`);
  if (!response.data.data) {
    throw new Error("Product data not found");
  }
  return normalizeProduct(response.data.data);
}

export async function getShopByIdApi(id: string): Promise<ShopDetails> {
  try {
    const response = await apiClient.get<ApiResponse<ShopDetails>>(`/shops/${id}`);
    if (response.data.data) return response.data.data;
  } catch (err) {
    // Fallback if full route is used
  }
  const response = await apiClient.get<ApiResponse<ShopDetails>>(`/api/shops/${id}`);
  if (!response.data.data) {
    throw new Error("Shop data not found");
  }
  return response.data.data;
}

export async function searchProductsApi(params?: ProductQueryParams): Promise<ProductSearchResponse> {
  const cleanParams: Record<string, any> = {};
  if (params) {
    if (params.q) cleanParams.q = params.q;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.shopId) cleanParams.shopId = params.shopId;
    if (params.minPrice !== undefined && !isNaN(params.minPrice)) cleanParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) cleanParams.maxPrice = params.maxPrice;
    if (params.sort) cleanParams.sort = params.sort;
  }

  try {
    const response = await apiClient.get<ApiResponse<any>>("/products/search", {
      params: cleanParams,
    });

    const rawData = response.data.data;
    let rawProducts: any[] = [];
    let pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

    if (Array.isArray(rawData)) {
      rawProducts = rawData;
      pagination = { page: 1, limit: rawData.length, total: rawData.length, totalPages: 1 };
    } else if (rawData && Array.isArray(rawData.products)) {
      rawProducts = rawData.products;
      pagination = rawData.pagination || { page: 1, limit: 12, total: rawProducts.length, totalPages: 1 };
    }

    const products = rawProducts.map(normalizeProduct);
    return { products, pagination };
  } catch (err) {
    console.warn("Product search endpoint failed, falling back to /products", err);
    try {
      const allProducts = await getProductsApi();
      return {
        products: allProducts,
        pagination: { page: 1, limit: allProducts.length, total: allProducts.length, totalPages: 1 },
      };
    } catch (fallbackErr) {
      console.error("Failed to fetch products fallback:", fallbackErr);
      return { products: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
    }
  }
}
