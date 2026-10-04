// Resolvers GraphQL del módulo de productos: implementan las consultas `products` y `product`,
// exigen que el usuario haya iniciado sesión y delegan en product.service la consulta a VTEX,
// traduciendo sus fallos a errores GraphQL legibles para el cliente
import { GraphQLError } from 'graphql';
import type { Context } from '../../graphql/context';
import { getProduct, listProducts } from './product.service';

function requireAuth(ctx: Context): void {
  if (!ctx.userId) {
    throw new GraphQLError('Debes iniciar sesión', { extensions: { code: 'UNAUTHENTICATED' } });
  }
}

function toGraphQLError(err: unknown): never {
  if (err instanceof Error && err.message === 'VTEX_UNAVAILABLE') {
    throw new GraphQLError('No se pudo consultar el catálogo. Intenta de nuevo.', {
      extensions: { code: 'VTEX_UNAVAILABLE' },
    });
  }
  throw err;
}

export const productResolvers = {
  Query: {
    products: async (
      _parent: unknown,
      args: { page?: number | null; search?: string | null },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      try {
        return await listProducts({ page: args.page ?? undefined, search: args.search ?? undefined });
      } catch (err) {
        toGraphQLError(err);
      }
    },

    product: async (_parent: unknown, args: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      try {
        return await getProduct(args.id);
      } catch (err) {
        toGraphQLError(err);
      }
    },
  },
};