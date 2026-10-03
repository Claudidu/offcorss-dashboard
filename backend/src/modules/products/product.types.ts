// Formato propio de la app. No depende de los nombres de VTEX

export interface Sku {
  itemId: string;
  size: string | null;
  price: number | null;
  listPrice: number | null;
  available: boolean;
  ean: string | null;
  thumbnail: string | null;
}

export interface Product {
  productId: string;
  name: string;
  brand: string;
  price: number | null;
  listPrice: number | null;
  discountPercent: number | null;
  available: boolean;
  thumbnail: string | null;
  images: string[];
  category: string | null;
  description: string | null;
  link: string | null;
  skus: Sku[];
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}