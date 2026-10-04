//   Es el "coordinador" de productos: Recibe lo que pide el resolver
//   (pagina y texto de busqueda), le pide los datos a VTEX con vtex.client,
//   los convierte al formato propio de la app con product.mapper y devuelve
//   la lista de productos junto con el total. 
// El resolver nunca habla directamente con VTEX: siempre pasa por aqui
//traduce "página 3" al rango de VTEX (_from=100, _to=149), 
// limita las páginas a 1–50 por el tope de 2.500 y busca un producto por id


import { searchVtexProducts } from './vtex.client';
import { toProduct } from './product.mapper';
import type { Product, ProductPage } from './product.types';

export const PAGE_SIZE = 50; // máximo por petición a VTEX
export const VTEX_MAX_RESULTS = 2500; // la API pública no pagina más allá
const MAX_PAGE = VTEX_MAX_RESULTS / PAGE_SIZE; // 50

export async function listProducts(params: { page?: number; search?: string }): Promise<ProductPage> {
  const search = params.search?.trim() || undefined;
  const page = Math.min(Math.max(1, Math.floor(params.page ?? 1)), MAX_PAGE);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { products, total } = await searchVtexProducts({ from, to, ft: search });

  return {
    items: products.map(toProduct),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.min(Math.ceil(total / PAGE_SIZE), MAX_PAGE),
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  // Solo dígitos: evita que un id raro altere la consulta a VTEX
  if (!/^\d+$/.test(id)) return null;
  const { products } = await searchVtexProducts({ from: 0, to: 0, fq: `productId:${id}` });
  return products[0] ? toProduct(products[0]) : null;
}