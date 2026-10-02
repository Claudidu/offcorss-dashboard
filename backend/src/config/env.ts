import 'dotenv/config';
import { z } from 'zod';

// Valida las variables de entorno al arrancar: si falta algo, el servidor
// se detiene, muestra un mensaje claro (en vez de fallar más adelante :)
const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string({ error: 'Falta MONGODB_URI en el .env' }).min(1, 'MONGODB_URI está vacía'),
  JWT_SECRET: z.string({ error: 'Falta JWT_SECRET en el .env' }).min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(28800), // segundos = 8 h
  SEED_PASSWORD: z.string().min(8, 'SEED_PASSWORD debe tener al menos 8 caracteres').optional(), //es opcional porque Render no corre el seed y no debe exigirla al arrancar
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
