//Lee y escribe en MongoDB

import { Schema, model, type InferSchemaType } from 'mongoose';

/*
 Voy a crear dos roles: admin y viewer. 
 El admin tiene acceso a todo, mientras que el viewer solo puede ver la información.

 PEROOOO, se desarrollará el viewer solo si hay tiempo :)
 
*/
/*export const USER_TYPES = ['admin', 'viewer'] as const;*/
   // Por ahora solo existe 'admin'. 'viewer' se agrega si se desarrolla el extra de roles
export const USER_TYPES = ['admin'] as const;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    //userType: { type: String, enum: USER_TYPES, required: true, default: 'viewer' },
    userType: { type: String, enum: USER_TYPES, required: true, default: 'admin' },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);



/*
Para username/name/email:
  -  unique:true; NO se pueden username repetidos, si se repite, se muestra mensaje al usuario
  -  lowercase:true; todo lo que escriban lleva a minusculas. Junto con Trim va sin problemas para el usuario


Para password:
   - Hash de la contraseña, no se guarda la contraseña en texto plano
   - select:false; para que no se muestre la contraseña en las consultas, ni siquiera en el postman. Solo se puede ver si se hace un select explícito de la propiedad passwordHash
   

Para tipo de usuario:
    - enum: USER_TYPES; para que solo pueda ser admin o viewer, no ambos

Para timestamps:
    - timestamps:true; para que se guarde la fecha de creación y actualización del usuario
    Mongoose agrega createdAt y updatedAt automáticamente
    createdAt es el Create Date que pide la prueba, así que no se hace a mano

  
*/