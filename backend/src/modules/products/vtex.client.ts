//   Es el "mensajero" entre el backend y VTEX. Se encarga de pedirle a
//   la API publica de VTEX una pagina de productos que puede estar filtrada
//   por un texto de busqueda, y devuelve esos productos junto con el total
//   que existen. Si VTEX no responde o responde con error, lanza el error 'VTEX_UNAVAILABLE'.


import { env } from '../../config/env'; // Variables de configuracion (ej. la URL de VTEX)
import type { VtexProduct } from './vtex.types'; // Forma de un producto de VTEX

// Tiempo maximo de espera por la respuesta de VTEX: 10 segundos
const TIMEOUT_MS = 10_000;

// Lo que devuelve esta funcion: una "pagina" de productos
export interface VtexPage {
  products: VtexProduct[]; // Los productos de esta pagina
  total: number; // Cuantos productos hay en total (en todas las paginas)
}

// Busca productos en VTEX.
//   from / to: rango de productos que queremos (ej. del 0 al 49 = primeros 50)
//   ft: texto de busqueda opcional (ej. "pijama")
export async function searchVtexProducts(params: {
  from: number;
  to: number;
  ft?: string;
}): Promise<VtexPage> {
  // Armamos la direccion de la busqueda: URL base de VTEX + ruta del catalogo
  const url = new URL('/api/catalog_system/pub/products/search/', env.VTEX_BASE_URL);
  // Le agregamos los parametros: desde, hasta y (si hay) el texto a buscar
  url.searchParams.set('_from', String(params.from));
  url.searchParams.set('_to', String(params.to));
  if (params.ft) url.searchParams.set('ft', params.ft);

  // Hacemos la peticion a VTEX
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json' }, // Pedimos la respuesta en JSON
      signal: AbortSignal.timeout(TIMEOUT_MS), // Si pasan 10 s, se cancela
    });
  } catch {
    // Red caida o VTEX tardo mas de 10 s
    throw new Error('VTEX_UNAVAILABLE');
  }

  // Si VTEX respondio con error (404, 500...), tambien lo tratamos como no disponible.
  // 206 Partial Content tambien es "ok" (cualquier 2xx)
  if (!res.ok) throw new Error('VTEX_UNAVAILABLE');

  // Convertimos la respuesta a una lista de productos
  const products = (await res.json()) as VtexProduct[];
  // El total viene en el encabezado "resources"; si no esta, usamos cuantos llegaron
  const total = parseTotal(res.headers.get('resources'), products.length);
  return { products, total };
}

// Saca el numero total del encabezado "resources".
// Header "resources": "0-49/1234" da como total 1234
// Si el encabezado no viene o no trae un numero valido, devuelve el valor de respaldo (fallback).
function parseTotal(header: string | null, fallback: number): number {
  const total = Number(header?.split('/')[1]); // Toma lo que esta despues de la "/"
  return Number.isFinite(total) ? total : fallback;
}
