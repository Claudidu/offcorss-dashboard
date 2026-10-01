import 'dotenv/config';
import { z } from 'zod';

// Valida las variables de entorno al arrancar: si falta algo, el servidor
// se detiene con un mensaje claro en vez de fallar más adelante.
const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string({ error: 'Falta MONGODB_URI en el .env' }).min(1, 'MONGODB_URI está vacía'),
  JWT_SECRET: z
    .string({ error: 'Falta JWT_SECRET en el .env' })
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno inválidas:');
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
