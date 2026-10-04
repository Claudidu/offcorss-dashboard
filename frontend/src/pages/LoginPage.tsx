import { useEffect, useState } from 'react';
import { gql } from '../api/graphql';

export default function LoginPage() {
  const [server, setServer] = useState('comprobando…');

  // Temporal: prueba que el frontend llega al backend (CORS)
  useEffect(() => {
    gql<{ health: string }>('{ health }')
      .then((d) => setServer(d.health))
      .catch((e: Error) => setServer(`error: ${e.message}`));
  }, []);

  return (
    <main className="pa4 sans-serif">
      <h1>Login</h1>
      <p>Servidor: {server}</p>
    </main>
  );
}