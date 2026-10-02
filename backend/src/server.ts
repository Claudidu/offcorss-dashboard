//arranca la aplicación: crea Express, conecta Mongo y abre la puerta /graphql
//Recibe la petición de GraphQL y entrega la respuesta
//arranca la aplicación: crea Express, conecta Mongo y abre la puerta /graphql
//Recibe la petición de GraphQL y entrega la respuesta
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { env } from './config/env';
import { connectMongo } from './db/mongo';
import { buildContext, type Context } from './graphql/context'; // nuevo
import { userTypeDefs } from './modules/users/user.typeDefs'; // nuevo
import { userResolvers } from './modules/users/user.resolvers'; // nuevo

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
    typeDefs: [baseTypeDefs, userTypeDefs], // nuevo: base + usuarios
    resolvers: [baseResolvers, userResolvers], // nuevo: base + usuarios
  });
  await apollo.start();

  // Ruta simple para verificar que el servidor está vivo (y "despertar" Render).
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(
    '/graphql',
    cors({ origin: env.CORS_ORIGIN.split(',') }),
    express.json(),
    expressMiddleware(apollo, { context: buildContext }), // nuevo: context en cada petición
  );

  app.listen(env.PORT, () => {
    console.log(`Servidor listo en http://localhost:${env.PORT}/graphql`);
  });
}

main().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});