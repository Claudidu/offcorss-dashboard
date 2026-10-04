/*
Se implementa una funcion fetch para reemplazar a Apollo client en todas las pantallas, utilizando un enfoque generico <T> 
para manejar cualquier tipo de respuesta de GraphQL garantizando el tipado esparado. Se maneja la autenticacion con token y se lanzan errores personalizados para el frontend
El token se almacena el localstorage para persistir ante recargas.
y se apoya en import.meta.env.PROD de Vite, las cuales se limitan solo a datos publicos como URLs de APIs y nunca a informaicon confidencial
*/

import { API_URL } from '../config';

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

// Única puerta del frontend hacia el backend
export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = localStorage.getItem('token');

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 'NETWORK');
  }

  let json: GraphQLResponse<T>;
  try {
    json = (await res.json()) as GraphQLResponse<T>;
  } catch {
    throw new ApiError('El servidor no respondió correctamente', 'BAD_RESPONSE');
  }

  if (json.errors?.length) {
    const first = json.errors[0];
    throw new ApiError(first.message, first.extensions?.code);
  }
  if (!json.data) throw new ApiError('Respuesta vacía del servidor', 'BAD_RESPONSE');
  return json.data;
}