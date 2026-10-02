export const userTypeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    name: String!
    lastName: String!
    email: String!
    userType: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input UpdateMeInput {
    name: String
    lastName: String
    email: String
  }

  extend type Query {
    me: User!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    updateMe(input: UpdateMeInput!): User!
  }
`;

/*
  - El login devuelve un token y el usuario. El token se guarda en el localStorage del navegador y se envía en cada request al backend
  - El updateMe permite cambiar nombre, apellido y email. No permite cambiar username ni contraseña
  - El me devuelve los datos del usuario logueado

  extend type Query: el Query base vive en server.ts (con health). 
  Cada módulo lo extiende con lo suyo. 
  Mañana productos hará lo mismo, y así cada módulo es dueño de su parte
*/