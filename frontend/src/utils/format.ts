/*
       Para REPORTE cada archivo hace:
       src/api/products.ts          → tipos y consulta GraphQL de productos
        src/utils/format.ts          → precios en pesos y números con puntos
        src/utils/csv.ts             → genera y descarga el CSV
        src/components/Dot.tsx       → punto ● disponible / ○ agotado
        src/components/ProductRows.tsx → fila padre + filas hijas (SKU)
        src/pages/ReportPage.tsx     → la pantalla: búsqueda, paginación, selección, exportar
*/

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null): string {
  return value === null ? '—' : money.format(value);
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-CO');
}