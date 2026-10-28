import { ProductItem } from "./productApi";
import { Product, ProductVariation } from "@/data/products";

/**
 * Transforms a backend ProductItem into the UI Product structure
 * used across store pages, ensuring real MongoDB `_id`, `slug`, images, and colors are preserved.
 */
export function adaptProductItem(item: ProductItem): Product {
  const images = [
    item.featuredImage,
    ...(item.gallary || []),
    ...(item.gallery || []),
  ].filter((img): img is string => typeof img === "string" && img.trim().length > 0);

  const mainImage = images[0] || "/placeholder-product.svg";

  const variations: ProductVariation[] = (item.color || []).map((c, idx) => ({
    id: c._id || `${item._id}-${idx}`,
    name: c.value,
    color: c.value,
    imagePath: images[idx] || mainImage,
    extraCost: 0,
    isAvailable: (c.stock || 0) > 0,
  }));

  const isPreOrder = item.status === "pre";
  const isFeatured = item.status === "featured";
  const hasDiscount = item.regularPrice > item.salePrice;

  let badge: string | undefined;
  let badgeVariant: Product["badgeVariant"];

  if (isPreOrder) {
    badge = "Pre-Order";
    badgeVariant = "preorder";
  } else if (isFeatured) {
    badge = "Featured";
    badgeVariant = "default";
  } else if (hasDiscount) {
    const diff = item.regularPrice - item.salePrice;
    badge = `Save ৳${diff.toLocaleString("en-BD")}`;
    badgeVariant = "discount";
  }

  return {
    id: item._id,
    slug: item.slug || item._id,
    name: item.name,
    category: item.category || "General",
    price: item.salePrice,
    originalPrice: hasDiscount ? item.regularPrice : undefined,
    rating: 4.9,
    reviewCount: 24,
    badge,
    badgeVariant,
    status: item.status,
    isPreOrder,
    isFeatured,
    description: item.description || "",
    highlights: [
      item.deliveryHeading || "Doorstep delivery across Bangladesh",
      `Authentic import sourced by ${item.Importer || "UniqueHub"}`,
      "100% customs clearance and local duties included",
    ],
    origin: item.Importer || "International Import",
    categoryColor: "#1e293b",
    image: mainImage,
    images: images.length > 0 ? images : [mainImage],
    variation:
      variations.length > 0
        ? variations
        : [
            {
              id: `${item._id}-default`,
              name: "Standard",
              color: "#1e293b",
              imagePath: mainImage,
              extraCost: 0,
              isAvailable: true,
            },
          ],
    preOrderEta: item.preOrderDetails?.launchDate
      ? new Date(item.preOrderDetails.launchDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "10-15 Business Days",
    specs: {
      Category: item.category,
      Importer: item.Importer || "UniqueHub Verified Importer",
      Delivery: item.deliveryHeading || "Direct shipping",
      Status: (item.status || "live").toUpperCase(),
    },
  };
}
