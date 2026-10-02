//contiene las reglas de negocio de los usuarios: cómo se protege una contraseña, cómo se crea un token y cómo se valida un login
//Decide: ¿la contraseña es correcta? ¿el token es válido?

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { User } from './user.model';
import { z } from 'zod';

// Cuántas "vueltas" hace bcrypt: más alto = más lento = más difícil de atacar.
const SALT_ROUNDS = 10;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Firma un token con el id del usuario en "sub" (el estandar de JWT que dice "de quién es")
export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

// Devuelve el id del usuario si el token es valido; null si es falso o esta vencido
export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

// Mismo error si el usuario no existe o la contraseña falla: no se muestra cuál de los dos fue el que falló
export async function login(username: string, password: string) {
  const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+passwordHash');
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) throw new Error('INVALID_CREDENTIALS');
  return { token: signToken(user.id), user };
}

export function getUserById(id: string) {
  return User.findById(id);
}

// Lista blanca: solo estos campos se pueden editar, aunque llegue algo más.
const EDITABLE_FIELDS = ['name', 'lastName', 'email'] as const;

export interface UpdateMeInput {
  name?: string;
  lastName?: string;
  email?: string;
}

export async function updateUser(id: string, input: UpdateMeInput) {
  const changes: Partial<Record<(typeof EDITABLE_FIELDS)[number], string>> = {};
  for (const field of EDITABLE_FIELDS) {
    const value = input[field]?.trim();
    if (value) changes[field] = value;
  }
  if (changes.email && !z.email().safeParse(changes.email).success) {
    throw new Error('INVALID_EMAIL');
  }
  return User.findByIdAndUpdate(id, { $set: changes }, { returnDocument: 'after', runValidators: true });
}

/*
Por qué de la lista blanca:
si GraphQL ya solo acepta esos tres campos ya es buena defensa
Si alguien llegase a llamar a updateUser desde otro lugar 
(un endpoint REST, un script), el servicio sigue sin 
dejar cambiar username ni userType. 
En otras palabras, la regla vive donde vive el negocio.
*/