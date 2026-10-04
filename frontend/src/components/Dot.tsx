/*
       Para REPORTE cada archivo hace:
       src/api/products.ts          → tipos y consulta GraphQL de productos
        src/utils/format.ts          → precios en pesos y números con puntos
        src/utils/csv.ts             → genera y descarga el CSV
        src/components/Dot.tsx       → punto ● disponible / ○ agotado
        src/components/ProductRows.tsx → fila padre + filas hijas (SKU)
        src/pages/ReportPage.tsx     → la pantalla: búsqueda, paginación, selección, exportar
*/

export default function Dot({ available }: { available: boolean }) {
  const label = available ? 'Disponible' : 'Agotado';
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`dib br-100 mr2 v-mid print-color ${available ? 'bg-green' : 'ba b--gray'}`}
      style={{ width: 10, height: 10 }}
    />
  );
}