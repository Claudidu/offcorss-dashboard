//   Es el "mensajero" entre el backend y VTEX. Se encarga de pedirle a
//   la API publica de VTEX una pagina de productos que puede estar filtrada
//   por un texto de busqueda, y devuelve esos productos junto con el total
//   que existen. Si VTEX no responde o responde con error, lanza el error 'VTEX_UNAVAILABLE'

import { env } from '../../config/env';
import type { VtexProduct } from './vtex.types';

const TIMEOUT_MS = 10_000;

export interface VtexPage {
  products: VtexProduct[];
  total: number;
}

export async function searchVtexProducts(params: {
  from: number;
  to: number;
  ft?: string; // búsqueda por texto
  fq?: string; // filtro exacto, ej. productId:51343501
}): Promise<VtexPage> {
  const url = new URL('/api/catalog_system/pub/products/search/', env.VTEX_BASE_URL);
  url.searchParams.set('_from', String(params.from));
  url.searchParams.set('_to', String(params.to));
  if (params.ft) url.searchParams.set('ft', params.ft);
  if (params.fq) url.searchParams.set('fq', params.fq);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // Red caída o VTEX tardó más de 10s
    throw new Error('VTEX_UNAVAILABLE');
  }

  // 206 Partial Content también es "ok" (cualquier 2xx)
  if (!res.ok) throw new Error('VTEX_UNAVAILABLE');

  const products = (await res.json()) as VtexProduct[];
  const total = parseTotal(res.headers.get('resources'), products.length);
  return { products, total };
}

// Header "resources": "0-49/2872" → 2872
function parseTotal(header: string | null, fallback: number): number {
  const total = Number(header?.split('/')[1]);
  return Number.isFinite(total) ? total : fallback;
}