import { GraphQLError } from 'graphql';
import type { Context } from '../../graphql/context';
import * as userService from './user.service';

function notAuthenticated() {
  return new GraphQLError('Debes iniciar sesión', { extensions: { code: 'UNAUTHENTICATED' } });
}

function requireUserId(ctx: Context): string {
  if (!ctx.userId) throw notAuthenticated();
  return ctx.userId;
}

export const userResolvers = {
  User: {
    // Mongo guarda la fecha como Date; la entregamos como texto ISO.
    createdAt: (user: { createdAt: Date }) => user.createdAt.toISOString(),
  },

  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => {
      const user = await userService.getUserById(requireUserId(ctx));
      if (!user) throw notAuthenticated();
      return user;
    },
  },

  Mutation: {
    login: async (_: unknown, args: { username: string; password: string }) => {
      try {
        return await userService.login(args.username, args.password);
      } catch (err) {
        if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
          throw new GraphQLError('Usuario o contraseña incorrectos', {
            extensions: { code: 'INVALID_CREDENTIALS' },
          });
        }
        throw err;
      }
    },

    updateMe: async (_: unknown, args: { input: userService.UpdateMeInput }, ctx: Context) => {
      try {
        const user = await userService.updateUser(requireUserId(ctx), args.input);
        if (!user) throw notAuthenticated();
        return user;
      } catch (err) {
        if (err instanceof Error && err.message === 'INVALID_EMAIL') {
          throw new GraphQLError('Email no válido', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        if ((err as { code?: number }).code === 11000) {
          throw new GraphQLError('Ese email ya está en uso', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw err;
      }
    },
  },
};

/*
El servicio lanza errores simples (INVALID_EMAIL) 
y el resolver los traduce a errores de GraphQL con un code
El servicio no sabe que existe GraphQL: así se respetan las capas
extensions.code: el frontend leeraa ese código para decidir que 
mostrar (por ejemplo, volver al login si es UNAUTHENTICATED)
11000: es el codigo que devuelve MongoDB cuando choca con un 
indice unico. Aqui el ndice email_1 hace su trabajo
User.createdAt: es un resolver de campo. 
Sin el, la fecha saldria como un numero raro
*/