/*
       Para REPORTE cada archivo hace:
       src/api/products.ts          → tipos y consulta GraphQL de productos
        src/utils/format.ts          → precios en pesos y números con puntos
        src/utils/csv.ts             → genera y descarga el CSV
        src/components/Dot.tsx       → punto ● disponible / ○ agotado
        src/components/ProductRows.tsx → fila padre + filas hijas (SKU)
        src/pages/ReportPage.tsx     → la pantalla: búsqueda, paginación, selección, exportar
*/
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { fetchProducts, type Product, type ProductPage } from '../api/products';
import ProductCard from '../components/ProductCard';
import ProductRows from '../components/ProductRows';
import { downloadCsv } from '../utils/csv';
import { formatNumber } from '../utils/format';

const VTEX_MAX_RESULTS = 2500;
const btn = 'btn btn-secondary mr2 mb2';

export default function ReportPage() {
  // Página y búsqueda viven en la URL: #/reporte?q=camiseta&page=2
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const search = params.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState<ProductPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<Map<string, Product>>(() => new Map());
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts(page, search)
      .then((d) => {
        if (!cancelled) setData(d);
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
  }, [page, search, reloadKey]);

  function goToPage(p: number) {
    const next: Record<string, string> = { page: String(p) };
    if (search) next.q = search;
    setParams(next);
    window.scrollTo(0, 0);
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchInput.trim();
    setParams(q ? { q } : {});
  }

  const items = data?.items ?? [];
  const allPageSelected = items.length > 0 && items.every((p) => selected.has(p.productId));

  function toggleSelect(product: Product) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.productId)) next.delete(product.productId);
      else next.set(product.productId, product);
      return next;
    });
  }

  function toggleSelectPage() {
    setSelected((prev) => {
      const next = new Map(prev);
      for (const p of items) {
        if (allPageSelected) next.delete(p.productId);
        else next.set(p.productId, p);
      }
      return next;
    });
  }

  function toggleExpand(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportSelected() {
    downloadCsv([...selected.values()], 'offcorss-seleccionados.csv');
  }

  async function exportAll() {
    if (!data) return;
    const totalPages = data.totalPages;
    const all: Product[] = [];
    setExportError(null);
    try {
      for (let p = 1; p <= totalPages; p++) {
        setExporting(`Exportando página ${p} de ${totalPages}…`);
        const res = await fetchProducts(p, search);
        all.push(...res.items);
      }
      downloadCsv(all, `offcorss-${search || 'catalogo'}.csv`);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'No se pudo exportar');
    } finally {
      setExporting(null);
    }
  }

  const from = data && data.items.length > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? from + data.items.length - 1 : 0;
  const exportable = data ? Math.min(data.total, VTEX_MAX_RESULTS) : 0;
  const atVtexLimit = !!data && data.total > VTEX_MAX_RESULTS && data.page === data.totalPages;

  const exportButtons = (
    <>
      <button type="button" className={btn} disabled={selected.size === 0 || !!exporting} onClick={exportSelected}>
        Exportar seleccionadas ({selected.size})
      </button>
      <button
        type="button"
        className={btn}
        disabled={!data || data.total === 0 || !!exporting || loading}
        onClick={exportAll}
      >
        Exportar todo ({formatNumber(exportable)})
      </button>
    </>
  );

  const pagination = data && data.total > 0 && (
    <nav aria-label="Paginación" className="flex flex-wrap items-center mv3">
      <button type="button" className={btn} disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>
        ‹ Anterior
      </button>
      <span className="mh2 mb2 f6">
        {formatNumber(from)} — {formatNumber(to)} de {formatNumber(data.total)}
      </span>
      <button
        type="button"
        className={btn}
        disabled={page >= data.totalPages || loading}
        onClick={() => goToPage(page + 1)}
      >
        Siguiente ›
      </button>
    </nav>
  );

  return (
    <main className="pa3 pb5 pa4-l">
      <h1 className="f3 mt0 oc-navy">Reporte de productos</h1>

      <div className="flex flex-wrap items-center justify-between">
        <form onSubmit={handleSearch} role="search" className="flex mb2 mr3 w-100 w-auto-l no-print">
          <label htmlFor="search" className="clip">Buscar productos</label>
          <input
            id="search"
            type="search"
            placeholder="Buscar productos…"
            className="field mr2"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
        <div className="flex flex-wrap items-center">
          {exportButtons}
          <button type="button" className={btn} onClick={() => window.print()} disabled={loading || items.length === 0}>
            Imprimir listado
          </button>
        </div>
      </div>

      {exporting && <p role="status" className="oc-blue">{exporting}</p>}
      {exportError && <p role="alert" className="oc-red">⚠ {exportError}</p>}
      {selected.size > 0 && (
        <p className="f6 gray no-print">
          {selected.size} seleccionadas (se conservan al cambiar de página) ·{' '}
          <button type="button" className="bn bg-transparent oc-blue underline pointer pa0" onClick={() => setSelected(new Map())}>
            Limpiar selección
          </button>
        </p>
      )}

      {pagination}

      {loading && <p role="status">Cargando productos…</p>}

      {!loading && error && (
        <div role="alert" className="ba b--light-red br3 pa3">
          <p className="mt0 oc-red">⚠ {error}</p>
          <button type="button" className={btn} onClick={() => setReloadKey((k) => k + 1)}>Reintentar</button>
        </div>
      )}

      {!loading && !error && data && data.total === 0 && <p>Sin resultados para «{search}».</p>}

      {!loading && !error && items.length > 0 && (
        <>
          {/* Escritorio (y papel): tabla padre/hijos */}
          <div className="dn db-l overflow-x-auto print-block">
            <table className="collapse w-100 f6">
              <thead>
                <tr className="tl bb b--gray oc-navy">
                  <th className="pa2">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todos los productos de esta página"
                      checked={allPageSelected}
                      onChange={toggleSelectPage}
                    />
                  </th>
                  <th className="pa2"><span className="clip">Desplegar</span></th>
                  <th className="pa2">Imagen</th>
                  <th className="pa2">Producto</th>
                  <th className="pa2">Marca</th>
                  <th className="pa2">Precio*</th>
                  <th className="pa2">Descuento*</th>
                  <th className="pa2">Tienda</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <ProductRows
                    key={p.productId}
                    product={p}
                    selected={selected.has(p.productId)}
                    expanded={!collapsed.has(p.productId)}
                    onToggleSelect={() => toggleSelect(p)}
                    onToggleExpand={() => toggleExpand(p.productId)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Celular: tarjetas */}
          <div className="db dn-l no-print">
            <label className="db mb3 f6">
              <input type="checkbox" className="mr2" checked={allPageSelected} onChange={toggleSelectPage} />
              Seleccionar los {items.length} de esta página
            </label>
            <ul className="list pl0 mt0">
              {items.map((p) => (
                <ProductCard
                  key={p.productId}
                  product={p}
                  selected={selected.has(p.productId)}
                  onToggleSelect={() => toggleSelect(p)}
                />
              ))}
            </ul>
          </div>

          <p className="f7 gray">* Campos adicionales</p>
          {pagination}
          {atVtexLimit && (
            <p className="f6 gray">
              La API pública de VTEX limita la consulta a 2.500 resultados. Usa el buscador para acotar.
            </p>
          )}
        </>
      )}

      {/* Celular: barra fija de exportar cuando hay seleccionadas (wireframe 3a, marcador 5) */}
      {selected.size > 0 && (
        <div className="no-print fixed bottom-0 left-0 right-0 bg-white bt b--light-gray pt2 ph2 flex flex-wrap justify-center dn-l" style={{ zIndex: 10 }}>
          {exportButtons}
        </div>
      )}
    </main>
  );
}