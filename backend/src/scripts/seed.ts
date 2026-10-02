/*
como la prueba pide un login, pero no pide un formulario de registro, 
se crea el primer usuario con el seed y se vuelvea ejecutar en estos casos:
  1. Si se cambia la contraseña del evaluador en el .env
  2. Si se borra la base de datos y se quiere volver a crear el usuario de prueba
  3. Si se quiere cambiar el email del evaluador en el .env 
  4. Si se llega a desarrollar el rol extra de viewer
  
Funciones de este archivo:
   1. Revisa que tenga la contraseña. Si falta SEED_PASSWORD en el .env, se detiene y avisa.
   2. Se conecta a MongoDB.   
   3. Se asegura de que existan los índices únicos, las reglas que impiden usernames o emails repetidos.
   4. Convierte la contraseña en hash con bcrypt. La contraseña real nunca se guarda.
   5. Busca a evaluador: si no existe → lo crea --- si ya existe → lo actualiza (por ejemplo, con una contraseña nueva).
   6. Imprime "Usuario listo" y se desconecta.

Por el paso 5 es idempotente: si se ejecuta una o diez veces y siempre queda un solo evaluador, con el mismo id y la misma fecha de creación.

Lo que no hace: 
   - no forma parte del servidor. 
   - Render nunca lo ejecuta. 
   - Se debe ejecutar a mano, solo cuando se necesita crear o actualizar al usuario de prueba.

*/


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