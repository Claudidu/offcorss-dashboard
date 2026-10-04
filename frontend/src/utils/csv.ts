/*
       Para REPORTE cada archivo hace:
       src/api/products.ts          → tipos y consulta GraphQL de productos
        src/utils/format.ts          → precios en pesos y números con puntos
        src/utils/csv.ts             → genera y descarga el CSV
        src/components/Dot.tsx       → punto ● disponible / ○ agotado
        src/components/ProductRows.tsx → fila padre + filas hijas (SKU)
        src/pages/ReportPage.tsx     → la pantalla: búsqueda, paginación, selección, exportar
*/


import type { Product } from '../api/products';

const HEADERS = [
  'productId', 'producto', 'marca', 'itemId', 'talla',
  'precio', 'precio_lista', 'descuento_%', 'disponible', 'ean', 'enlace',
];

// Encierra en comillas si el valor tiene ; comillas o saltos de línea
function cell(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Una fila por SKU: así se ve cada talla con su disponibilidad y EAN
export function productsToCsv(products: Product[]): string {
  const lines = [HEADERS.join(';')];
  for (const p of products) {
    for (const s of p.skus) {
      lines.push(
        [
          p.productId, p.name, p.brand, s.itemId, s.size,
          s.price, s.listPrice, p.discountPercent,
          s.available ? 'sí' : 'no', s.ean, p.link,
        ].map(cell).join(';'),
      );
    }
  }
  return lines.join('\r\n');
}

export function downloadCsv(products: Product[], fileName: string): void {
  // \uFEFF (BOM) hace que Excel lea bien las tildes y la ñ
  const blob = new Blob(['\uFEFF' + productsToCsv(products)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}