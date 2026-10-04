/*
       Para REPORTE cada archivo hace:
       src/api/products.ts          → tipos y consulta GraphQL de productos
        src/utils/format.ts          → precios en pesos y números con puntos
        src/utils/csv.ts             → genera y descarga el CSV
        src/components/Dot.tsx       → punto ● disponible / ○ agotado
        src/components/ProductRows.tsx → fila padre + filas hijas (SKU)
        src/pages/ReportPage.tsx     → la pantalla: búsqueda, paginación, selección, exportar
*/

import { gql } from './graphql';

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
  link: string | null;
  skus: Sku[];
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Solo lo que el reporte necesita (el detalle pedirá además galería, categoría y descripción)
const PRODUCT_FIELDS = `
  productId name brand price listPrice discountPercent available thumbnail images link
  skus { itemId size price listPrice available ean thumbnail }
`;

export async function fetchProducts(page: number, search: string): Promise<ProductPage> {
  const data = await gql<{ products: ProductPage }>(
    `query Products($page: Int, $search: String) {
      products(page: $page, search: $search) {
        total totalPages page pageSize
        items { ${PRODUCT_FIELDS} }
      }
    }`,
    { page, search: search || null },
  );
  return data.products;
}