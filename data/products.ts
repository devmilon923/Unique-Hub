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

export const PRODUCT_CATEGORIES = [
  "mens",
  "women",
  "baby",
  "gadgets",
  "lights",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  mens: "Mens",
  women: "Women",
  baby: "Baby",
  gadgets: "Gadgets",
  lights: "Lights",
};

export const CATEGORIES = [
  "All",
  "Mens",
  "Women",
  "Baby",
  "Gadgets",
  "Lights",
] as const;

export type CategoryType = (typeof CATEGORIES)[number] | string;

/**
 * Normalizes any category string (mixed case, singular, plural, punctuation)
 * into the server-canonical lowercase category key.
 * e.g., "Mens", "Men's", "MEN" -> "mens"
 *       "Women", "Women's"     -> "women"
 *       "Baby", "Babies"       -> "baby"
 *       "Gadget", "Gadgets"    -> "gadgets"
 *       "Light", "Lights"      -> "lights"
 */
export function normalizeCategory(category: string): string {
  if (!category) return "";
  const clean = category.trim().toLowerCase();
  if (/^men('?s)?$/i.test(clean) || clean === "mens" || clean === "men") return "mens";
  if (/^wom[ae]n('?s)?$/i.test(clean) || clean === "women" || clean === "womens") return "women";
  if (/^bab(y|ies)?$/i.test(clean) || clean === "baby") return "baby";
  if (/^gadgets?$/i.test(clean) || clean === "gadget" || clean === "gadgets") return "gadgets";
  if (/^lights?$/i.test(clean) || clean === "light" || clean === "lights" || clean === "lighting") return "lights";
  return clean;
}

/**
 * Formats a category string for UI display.
 */
export function formatCategory(category: string): string {
  if (!category) return "";
  const normalized = normalizeCategory(category) as ProductCategory;
  if (CATEGORY_LABELS[normalized]) {
    return CATEGORY_LABELS[normalized];
  }
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Checks whether a given string corresponds to one of the 5 supported categories.
 */
export function isValidCategory(category: string): boolean {
  const norm = normalizeCategory(category);
  return PRODUCT_CATEGORIES.includes(norm as ProductCategory);
}

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
