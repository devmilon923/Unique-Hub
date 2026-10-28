export interface ProductVariation {
  id?: string;
  name: string;
  color: string; // Color code (hex or css color format, e.g. #1e293b)
  imagePath: string; // Product image path
  extraCost: number; // Additional cost added to base product price
  isAvailable: boolean; // Availability status (not stock, indicates import/region/catalog eligibility)
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "preorder" | "discount" | "success";
  status?: "pre" | "live" | "featured" | "hidden";
  isPreOrder?: boolean;
  isFeatured?: boolean;
  preOrderBatch?: string;
  preOrderEta?: string;
  preOrderSlots?: {
    total: number;
    booked: number;
  };
  description: string;
  highlights: string[];
  origin: string;
  categoryColor: string;
  image: string;
  images?: string[];
  variation: ProductVariation[];
  specs?: Record<string, string>;
}

export const CATEGORIES = [
  "All",
  "Electronics",
  "Accessories",
  "Audio",
  "Computing",
  "Smart Home",
  "Gadgets",
  "Wearables",
] as const;

export type CategoryType = string;

/**
 * Empty product catalog. Real products are loaded directly
 * from the UniqueHub backend API (/api/product).
 */
export const PRODUCTS: Product[] = [];

/**
 * Helper to find a product by ID or slug in a given product array.
 */
export function getProductById(id: string, list: Product[] = PRODUCTS): Product | undefined {
  return list.find((p) => p.id === id || p.slug === id);
}

/**
 * Helper to compute related products within an array.
 */
export function getRelatedProducts(
  product: Product,
  list: Product[] = PRODUCTS,
  limit = 4
): Product[] {
  const sameCategory = list.filter(
    (p) => p.id !== product.id && p.category === product.category
  );
  const diffCategory = list.filter(
    (p) => p.id !== product.id && p.category !== product.category
  );
  return [...sameCategory, ...diffCategory].slice(0, limit);
}
