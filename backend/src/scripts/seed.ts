import mongoose from 'mongoose';
import { env } from '../config/env';
import { connectMongo } from '../db/mongo';
import { User } from '../modules/users/user.model';
import { hashPassword } from '../modules/users/user.service';

// Crea o actualiza al usuario de prueba. Se puede correr varias veces sin problemas, 
// ya que hace un upsert (update or insert)
async function main() {
  if (!env.SEED_PASSWORD) throw new Error('Falta SEED_PASSWORD en el .env');

  await connectMongo();
  await User.init(); // espera a que existan los índices únicos

  const passwordHash = await hashPassword(env.SEED_PASSWORD);

  const user = await User.findOneAndUpdate(
    { username: 'evaluador' },
    {
      $set: {
        passwordHash,
        name: 'Evaluador',
        lastName: 'Offcorss',
        email: 'evaluador@offcorss.test',
        userType: 'admin',
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`Usuario listo: ${user.username} (id ${user.id})`);
}

main()
  .catch((err) => {
    console.error('Seed falló:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());