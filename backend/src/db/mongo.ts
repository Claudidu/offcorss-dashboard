import mongoose from 'mongoose';
import { env } from '../config/env';

// Conexión única a MongoDB Atlas. Se llama una vez al iniciar el servidor.
export async function connectMongo(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { dbName: 'offcorss' });
  console.log('MongoDB conectado');
}
