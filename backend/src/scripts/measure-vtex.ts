import { searchVtexProducts } from '../modules/products/vtex.client';
import { toProduct } from '../modules/products/product.mapper';

async function main() {
  const { products, total } = await searchVtexProducts({ from: 0, to: 9 });
  const mapped = products.map(toProduct);

  const rawKb = JSON.stringify(products).length / 1024;
  const mappedKb = JSON.stringify(mapped).length / 1024;

  console.log('Total del catálogo:', total);
  console.log(`VTEX: ${rawKb.toFixed(0)} KB → mapeado: ${mappedKb.toFixed(1)} KB (${(rawKb / mappedKb).toFixed(0)}x menos)`);
  console.log(JSON.stringify(mapped[0], null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});