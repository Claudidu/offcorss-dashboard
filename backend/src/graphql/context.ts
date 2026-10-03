/*
un objeto que la libreria de graphql (Apollo) arma en cada petición, 
antes de los resolvers.
 Aqui se pone "quién está pidiendo esto" (el id que sale del token).
*/

import type { Request } from 'express';
import { verifyToken } from '../modules/users/user.service';

export interface Context {
  userId: string | null; // null = petición sin sesión válida
}

// Se ejecuta en cada petición: lee el token y deja el id del usuario a mano.
export async function buildContext({ req }: { req: Request }): Promise<Context> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return { userId: token ? verifyToken(token) : null };
}
