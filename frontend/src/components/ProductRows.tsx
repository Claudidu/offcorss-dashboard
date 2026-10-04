/*
       Para REPORTE cada archivo hace:
       src/api/products.ts          → tipos y consulta GraphQL de productos
        src/utils/format.ts          → precios en pesos y números con puntos
        src/utils/csv.ts             → genera y descarga el CSV
        src/components/Dot.tsx       → punto ● disponible / ○ agotado
        src/components/ProductRows.tsx → fila padre + filas hijas (SKU)
        src/pages/ReportPage.tsx     → la pantalla: búsqueda, paginación, selección, exportar
*/

import { Link } from 'react-router';
import type { Product } from '../api/products';
import { formatPrice } from '../utils/format';
import Dot from './Dot';

interface Props {
  product: Product;
  selected: boolean;
  expanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
}

export default function ProductRows({ product, selected, expanded, onToggleSelect, onToggleExpand }: Props) {
  const hasDiscount =
    product.listPrice !== null && product.price !== null && product.listPrice > product.price;

  return (
    <>
      <tr className="bt b--light-gray">
        <td className="pa2">
          <input
            type="checkbox"
            aria-label={`Seleccionar ${product.name}`}
            checked={selected}
            onChange={onToggleSelect}
          />
        </td>
        <td className="pa2">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            aria-label={expanded ? 'Plegar tallas' : 'Desplegar tallas'}
            className="bn bg-transparent pointer f5"
          >
            {expanded ? '⌄' : '›'}
          </button>
        </td>
        <td className="pa2 nowrap">
          <Dot available={product.available} />
          {product.thumbnail && (
            <img src={product.thumbnail} alt="" width={48} height={48} loading="lazy" className="v-mid" />
          )}
        </td>
        <td className="pa2">
          <Link to={`/producto/${product.productId}`} className="b link dark-blue hover-blue">
            {product.name}
          </Link>
          <div className="f7 gray">{product.productId}</div>
        </td>
        <td className="pa2">{product.brand}</td>
        <td className="pa2 nowrap">
          {formatPrice(product.price)}
          {hasDiscount && <div className="f7 gray strike">{formatPrice(product.listPrice)}</div>}
        </td>
        <td className="pa2">{product.discountPercent ? `-${product.discountPercent} %` : '—'}</td>
        <td className="pa2">
          {product.link && (
            <a href={product.link} target="_blank" rel="noopener noreferrer" className="link blue">
              Tienda ↗
            </a>
          )}
        </td>
      </tr>

      {expanded &&
        product.skus.map((sku) => (
          <tr key={sku.itemId} className="mid-gray">
            <td />
            <td />
            <td colSpan={6} className="pv1 ph2 pl4">
              <Dot available={sku.available} />
              {sku.thumbnail && (
                <img src={sku.thumbnail} alt="" width={28} height={28} loading="lazy" className="v-mid mr2" />
              )}
              {sku.itemId} · Talla {sku.size ?? '—'} · {sku.available ? formatPrice(sku.price) : 'Agotado'}
            </td>
          </tr>
        ))}
    </>
  );
}