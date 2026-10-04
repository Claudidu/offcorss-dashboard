import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { fetchProduct, type ProductDetail } from '../api/products';
import Dot from '../components/Dot';
import { formatPrice } from '../utils/format';
import { resizeVtexImage } from '../utils/images';

export default function ProductPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setActiveImage(0);
    fetchProduct(id)
      .then((p) => {
        if (cancelled) return;
        if (p) setProduct(p);
        else setNotFound(true);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error inesperado');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Desde el reporte, "atrás" conserva ?q= y ?page=. Con enlace directo, va al reporte.
  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/reporte');
  }

  const toolbar = (
    <div className="flex flex-wrap justify-between items-center mb3 no-print">
      <button type="button" className="btn btn-secondary mb2" onClick={goBack}>← Volver al reporte</button>
      {product && !loading && (
        <button type="button" className="btn btn-primary mb2" onClick={() => window.print()}>Imprimir</button>
      )}
    </div>
  );

  if (loading) return <main className="pa3 pa4-l">{toolbar}<p role="status">Cargando producto…</p></main>;

  if (error) {
    return (
      <main className="pa3 pa4-l">
        {toolbar}
        <div role="alert" className="ba b--light-red br3 pa3">
          <p className="mt0 oc-red">⚠ {error}</p>
          <button type="button" className="btn btn-secondary" onClick={() => setReloadKey((k) => k + 1)}>Reintentar</button>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return <main className="pa3 pa4-l">{toolbar}<p>No se encontró el producto {id}.</p></main>;
  }

  const images = product.images;
  const mainImage = images[activeImage] ?? images[0];
  const hasDiscount =
    product.listPrice !== null && product.price !== null && product.listPrice > product.price;

  return (
    <main className="pa3 pa4-l">
      {toolbar}

      <article className="mw8 center">
        <p className="print-only f6 mt0">
          Ficha de producto · Offcorss · {new Date().toLocaleDateString('es-CO')}
        </p>

        <div className="flex flex-wrap">
          {/* Galería: en papel solo sale la imagen principal */}
          <div className="w-100 w-50-l pr4-l mb3">
            {mainImage && (
              <img
                src={resizeVtexImage(mainImage, 600)}
                alt={product.name}
                width={600}
                height={600}
                className="db w-100 h-auto br3 bg-oc-gray"
                style={{ maxWidth: 600 }}
              />
            )}
            {images.length > 1 && (
              <ul className="list pl0 flex flex-wrap mt2 no-print">
                {images.map((url, i) => (
                  <li key={url} className="mr2 mb2">
                    <button
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                      aria-pressed={i === activeImage}
                      className={`pa0 bg-white pointer br2 ba bw1 ${i === activeImage ? 'b--oc-red' : 'b--light-gray'}`}
                    >
                      <img src={resizeVtexImage(url, 80)} alt="" width={64} height={64} loading="lazy" className="db br2" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Datos */}
          <div className="w-100 w-50-l">
            <h1 className="f3 mt0 oc-navy">{product.name}</h1>
            <p className="f4 mv2">
              <span className="b oc-red">{formatPrice(product.price)}</span>
              {hasDiscount && <span className="f6 gray strike ml2">{formatPrice(product.listPrice)}</span>}
              {product.discountPercent ? <span className="f6 b ml2">-{product.discountPercent} %</span> : null}
              <span className="f7 gray ml1">*</span>
            </p>

            <dl className="f6">
              <dt className="b">productId</dt>
              <dd className="ml0 mb2">{product.productId}</dd>
              <dt className="b">Marca</dt>
              <dd className="ml0 mb2">{product.brand}</dd>
              <dt className="b">Categoría*</dt>
              <dd className="ml0 mb2">{product.category ?? '—'}</dd>
              <dt className="b">Descripción*</dt>
              <dd className="ml0 mb2" style={{ whiteSpace: 'pre-line' }}>{product.description ?? '—'}</dd>
            </dl>

            {product.link && (
              <a href={product.link} target="_blank" rel="noopener noreferrer" className="link oc-blue f6 print-url">
                Ver en tienda ↗*
              </a>
            )}
          </div>
        </div>

        {/* Ítems: un SKU por talla */}
        <h2 className="f5 mt4 oc-navy">Ítems (SKU)</h2>
        <div className="overflow-x-auto">
          <table className="collapse w-100 f6">
            <thead>
              <tr className="tl bb b--gray">
                <th className="pa2">Estado</th>
                <th className="pa2">itemId</th>
                <th className="pa2">Talla</th>
                <th className="pa2">Precio*</th>
                <th className="pa2">EAN*</th>
              </tr>
            </thead>
            <tbody>
              {product.skus.map((sku) => (
                <tr key={sku.itemId} className="bb b--near-white">
                  <td className="pa2 nowrap"><Dot available={sku.available} />{sku.available ? 'Disponible' : 'Agotado'}</td>
                  <td className="pa2">{sku.itemId}</td>
                  <td className="pa2">{sku.size ?? '—'}</td>
                  <td className="pa2 nowrap">{formatPrice(sku.price)}</td>
                  <td className="pa2">{sku.ean ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="f7 gray">* Campos adicionales</p>
      </article>
    </main>
  );
}
