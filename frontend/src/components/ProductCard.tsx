import { Link } from 'react-router';
import type { Product } from '../api/products';
import { formatPrice } from '../utils/format';
import Dot from './Dot';

interface Props {
  product: Product;
  selected: boolean;
  onToggleSelect: () => void;
}

// Versión celular de ProductRows (wireframe 3a, columna izquierda)
export default function ProductCard({ product, selected, onToggleSelect }: Props) {
  const hasDiscount =
    product.listPrice !== null && product.price !== null && product.listPrice > product.price;

  return (
    <li className="ba b--light-gray br3 pa3 mb3 bg-white">
      <div className="flex items-start">
        <input
          type="checkbox"
          className="mt1 mr2"
          aria-label={`Seleccionar ${product.name}`}
          checked={selected}
          onChange={onToggleSelect}
        />
        {product.thumbnail && (
          <img src={product.thumbnail} alt="" width={64} height={64} loading="lazy" className="br2" />
        )}
        <div className="ml2 flex-auto">
          <Link to={`/producto/${product.productId}`} className="b link oc-navy hover-oc-red">
            {product.name}
          </Link>
          <div className="f7 gray mt1">{product.productId} · {product.brand}</div>
          <div className="mt1">
            <span className="b oc-red">{formatPrice(product.price)}</span>
            {hasDiscount && <span className="f7 gray strike ml2">{formatPrice(product.listPrice)}</span>}
            {product.discountPercent ? <span className="f7 b ml2">-{product.discountPercent} %</span> : null}
          </div>
        </div>
      </div>

      <ul className="list pl0 mt2 mb0 f7">
        {product.skus.map((sku) => (
          <li key={sku.itemId} className="pv1 bt b--near-white">
            <Dot available={sku.available} />
            {sku.itemId} · Talla {sku.size ?? '—'} · {sku.available ? formatPrice(sku.price) : 'Agotado'}
          </li>
        ))}
      </ul>

      {product.link && (
        <a href={product.link} target="_blank" rel="noopener noreferrer" className="db mt2 f7 link oc-blue">
          Ver en tienda ↗
        </a>
      )}
    </li>
  );
}