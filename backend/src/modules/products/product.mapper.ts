import type { VtexItem, VtexProduct } from './vtex.types';
import type { Product, Sku } from './product.types';

const THUMB_SIZE = 120;

// .../arquivos/ids/905042/foto.jpg → .../arquivos/ids/905042-120-120/foto.jpg
export function resizeImage(url: string, size = THUMB_SIZE): string {
  return url.replace(/\/ids\/(\d+)\//, `/ids/$1-${size}-${size}/`);
}

export function toSku(item: VtexItem): Sku {
  const offer = item.sellers[0]?.commertialOffer;
  const firstImage = item.images[0]?.imageUrl;

  return {
    itemId: item.itemId,
    size: item.Talla?.[0] ?? null,
    price: offer?.Price ?? null,
    listPrice: offer?.ListPrice ?? null,
    available: Boolean(offer?.IsAvailable && offer.AvailableQuantity > 0),
    ean: item.ean?.trim() || null,
    thumbnail: firstImage ? resizeImage(firstImage) : null,
  };
}

// El SKU disponible con el precio más bajo ("desde $X")
function cheapestAvailable(skus: Sku[]): Sku | null {
  let best: Sku | null = null;
  for (const sku of skus) {
    if (!sku.available || sku.price === null) continue;
    if (best === null || sku.price < (best.price ?? Infinity)) best = sku;
  }
  return best;
}

function discountPercent(price: number | null, listPrice: number | null): number | null {
  if (price === null || listPrice === null || listPrice <= 0) return null;
  if (price >= listPrice) return 0;
  return Math.round((1 - price / listPrice) * 100);
}

// "/Niño/Camisetas/" -- "Niño › Camisetas"
function formatCategory(path: string | undefined): string | null {
  if (!path) return null;
  const parts = path.split('/').filter(Boolean);
  return parts.length ? parts.join(' › ') : null;
}

export function toProduct(p: VtexProduct): Product {
  const skus = p.items.map(toSku);
  // Si todo está agotado, se muestra el precio del primer SKU como referencia
  const reference = cheapestAvailable(skus) ?? skus[0] ?? null;
  const images = (p.items[0]?.images ?? []).map((img) => img.imageUrl);

  return {
    productId: p.productId,
    name: p.productName,
    brand: p.brand,
    price: reference?.price ?? null,
    listPrice: reference?.listPrice ?? null,
    discountPercent: discountPercent(reference?.price ?? null, reference?.listPrice ?? null),
    available: skus.some((s) => s.available),
    thumbnail: images[0] ? resizeImage(images[0]) : null,
    images,
    category: formatCategory(p.categories[0]),
    description: p.description?.trim() || null,
    link: p.link || null,
    skus,
  };
}