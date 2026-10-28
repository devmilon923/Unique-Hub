import { api, ApiResponse } from "./axios";
import { normalizeCategory } from "@/data/products";

export type ProductStatus = "pre" | "live" | "featured" | "hidden";

export interface ProductColor {
  value: string; // Hex code (e.g. "#000000") or color name
  stock: number;
  _id?: string;
}

export interface PreOrderDetails {
  launchDate?: string | Date;
}

export interface ProductItem {
  _id: string;
  name: string;
  regularPrice: number;
  salePrice: number;
  slug: string;
  description: string;
  Importer: string;
  category: string;
  color: ProductColor[];
  deliveryHeading: string;
  status: ProductStatus;
  featuredImage?: string;
  gallary?: string[];
  gallery?: string[];
  preOrderDetails?: PreOrderDetails;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ProductPagination {
  totalData: number;
  totalPage: number;
  currentPage: number;
  nextPage: number;
  prevPage: number;
}

export interface ProductListResponseData {
  result: ProductItem[];
  pagination: ProductPagination;
}

export interface CreateProductInput {
  name: string;
  regularPrice: number;
  salePrice: number;
  slug: string;
  description: string;
  Importer: string;
  category: string;
  color: ProductColor[];
  deliveryHeading: string;
  status: ProductStatus;
  featuredImage: string;
  gallary: string[];
  gallery?: string[];
  preOrderDetails?: {
    launchDate: string | Date;
  };
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

export const productApi = {
  /**
   * Fetch paginated products with optional filters for category and status.
   * Ensures category query parameter is passed in server-canonical lowercase.
   */
  async getAll(
    query?: ProductFilterQuery
  ): Promise<ProductListResponseData> {
    const params: Record<string, any> = { ...query };
    if (params.category) {
      const trimmed = String(params.category).trim();
      if (trimmed.toLowerCase() === "all" || !trimmed) {
        delete params.category;
      } else {
        params.category = normalizeCategory(trimmed);
      }
    }

    const res = await api.get<ApiResponse<ProductListResponseData>>("/product", {
      params,
    });
    const data = res.data?.data;
    return {
      result: Array.isArray(data?.result) ? data.result : [],
      pagination: data?.pagination || {
        totalData: 0,
        totalPage: 1,
        currentPage: 1,
        nextPage: 0,
        prevPage: 0,
      },
    };
  },

  /**
   * Fetch single product by slug or ObjectId (Public)
   */
  async getBySlugOrId(slugOrId: string): Promise<ProductItem> {
    const res = await api.get<ApiResponse<ProductItem>>(
      `/product/details/${encodeURIComponent(slugOrId)}`
    );
    return res.data.data;
  },

  /**
   * Fetch related products for recommendations (Public)
   */
  async getRelated(
    category?: string,
    excludeId?: string,
    limit: number = 4
  ): Promise<ProductItem[]> {
    try {
      const normalizedCat = category ? normalizeCategory(category) : undefined;
      const res = await this.getAll({
        category: normalizedCat,
        limit: limit + 2,
      });
      const filtered = (res.result || []).filter(
        (p) => p._id !== excludeId && p.status !== "hidden"
      );
      if (filtered.length >= limit || !normalizedCat) {
        return filtered.slice(0, limit);
      }
      // If same category didn't have enough, fetch general products
      const fallbackRes = await this.getAll({ limit: limit + 2 });
      const fallbackList = (fallbackRes.result || []).filter(
        (p) =>
          p._id !== excludeId &&
          p.status !== "hidden" &&
          !filtered.some((f) => f._id === p._id)
      );
      return [...filtered, ...fallbackList].slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * Add a new product (Admin protected) - ensures category is saved in lowercase
   */
  async create(data: CreateProductInput): Promise<ProductItem> {
    const payload: CreateProductInput = {
      ...data,
      category: normalizeCategory(data.category),
    };
    const res = await api.post<ApiResponse<ProductItem>>("/product", payload);
    return res.data.data;
  },

  /**
   * Edit existing product by ObjectId (Admin protected) - ensures category is saved in lowercase
   */
  async update(id: string, data: UpdateProductInput): Promise<ProductItem> {
    const payload: UpdateProductInput = {
      ...data,
      ...(data.category ? { category: normalizeCategory(data.category) } : {}),
    };
    const res = await api.patch<ApiResponse<ProductItem>>(
      `/product/edit/${encodeURIComponent(id)}`,
      payload
    );
    return res.data.data;
  },

  /**
   * Delete product by ObjectId (Admin protected)
   */
  async delete(id: string): Promise<ProductItem> {
    const res = await api.delete<ApiResponse<ProductItem>>(
      `/product/delete/${encodeURIComponent(id)}`
    );
    return res.data.data;
  },
};
