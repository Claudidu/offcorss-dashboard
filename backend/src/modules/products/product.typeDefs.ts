// Esquema GraphQL del módulo de productos: define los tipos (Sku, Product, ProductPage)
// que expone la API a partir de los datos de VTEX, y extiende Query con la consulta
// paginada de productos (con búsqueda opcional) y la consulta de un producto por id
export const productTypeDefs = `#graphql
  type Sku {
    itemId: ID!
    size: String
    price: Float
    listPrice: Float
    available: Boolean!
    ean: String
    thumbnail: String
  }

  type Product {
    productId: ID!
    name: String!
    brand: String!
    price: Float
    listPrice: Float
    discountPercent: Int
    available: Boolean!
    thumbnail: String
    images: [String!]!
    category: String
    description: String
    link: String
    skus: [Sku!]!
  }

  type ProductPage {
    items: [Product!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  extend type Query {
    products(page: Int, search: String): ProductPage!
    product(id: ID!): Product
  }
`;