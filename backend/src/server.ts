//arranca la aplicación: crea Express, conecta Mongo y abre la puerta /graphql
//Recibe la petición de GraphQL y entrega la respuesta
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { env } from './config/env';
import { connectMongo } from './db/mongo';
import { buildContext, type Context } from './graphql/context';
import { userTypeDefs } from './modules/users/user.typeDefs';
import { userResolvers } from './modules/users/user.resolvers';
import { productTypeDefs } from './modules/products/product.typeDefs';
import { productResolvers } from './modules/products/product.resolvers';

// Base del esquema: cada módulo la extiende con "extend type Query".
const baseTypeDefs = `#graphql
  type Query {
    health: String!
  }
`;

const baseResolvers = {
  Query: {
    health: () => 'ok',
  },
};

async function main(): Promise<void> {
  await connectMongo();

  const app = express();
  const apollo = new ApolloServer<Context>({
    typeDefs: [baseTypeDefs, userTypeDefs, productTypeDefs],
    resolvers: [baseResolvers, userResolvers, productResolvers],
  });
  await apollo.start();

  // Ruta para verificar que el servidor está vivo (y "despertar" Render).
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Ruta raíz: describe la API cuando abra la URL en el navegador
  app.get('/', (_req, res) => {
    res.json({ api: 'offcorss-dashboard', health: '/health', graphql: '/graphql' });
  });

  app.use(
    '/graphql',
    cors({ origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()) }),
    express.json(),
    expressMiddleware(apollo, { context: buildContext }), // context en cada petición (lee el token)
  );

  app.listen(env.PORT, () => {
    console.log(`Servidor listo en http://localhost:${env.PORT}/graphql`);
  });
}

main().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});