
//   Describe la "forma" de los datos de productos que nos devuelve VTEX
//   (la plataforma de la tienda en linea). Asi TypeScript sabe que campos
//   trae cada producto y nos avisa si escribimos mal un nombre.
//
//   Solo se listan los campos que la app usa. El JSON real de VTEX trae
//   muchos mas (PaymentOptions, Installments...), que el mapper descarta.

// Oferta de un vendedor: precio y disponibilidad de una variante
export interface VtexOffer {
  Price: number; // Precio actual (el que paga el cliente)
  ListPrice: number; // Precio "antes" o de lista (sirve para mostrar descuentos)
  AvailableQuantity: number; // Unidades disponibles en inventario
  IsAvailable: boolean; // true si se puede comprar ahora mismo
}

// Una foto del producto
export interface VtexImage {
  imageId: string; // Identificador de la imagen en VTEX
  imageUrl: string; // Direccion web donde esta la imagen
}

// Una variante del producto (por ejemplo, la misma camis en talla 4)
export interface VtexItem {
  itemId: string; // Identificador de la variante (SKU)
  name: string; // Nombre de la variante
  ean: string; // Codigo de barras
  Talla?: string[]; // Talla(s) de la variante; puede no venir (por eso el "?")
  images: VtexImage[]; // Fotos de esta variante
  sellers: { commertialOffer: VtexOffer }[]; // Vendedores con su precio e inventario
}

// El producto completo, tal como lo entrega la busqueda de VTEX
export interface VtexProduct {
  productId: string; // Identificador del producto
  productName: string; // Nombre que se muestra en la tienda
  brand: string; // Marca
  linkText: string; // Enlace a la pagina del producto en la tienda
  categories: string[]; // Categorias a las que pertenece (ej. "/Ninos/Camisetas/")
  description: string; // Descripcion del producto
  items: VtexItem[]; // Todas sus variantes (tallas, colores...)
}
