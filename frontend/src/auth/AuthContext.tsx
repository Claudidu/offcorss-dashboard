import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiError, gql } from '../api/graphql';

export interface User {
  username: string;
  name: string;
  lastName: string;
  email: string;
  userType: string;
  createdAt: string;
}

// Campos que se piden siempre del usuario (login, me, updateMe)
export const USER_FIELDS = 'username name lastName email userType createdAt';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app: si hay token guardado, recupera al usuario con `me`
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    gql<{ me: User }>(`{ me { ${USER_FIELDS} } }`)
      .then((data) => setUser(data.me))
      .catch((err) => {
        // Token vencido o alterado: se descarta
        if (err instanceof ApiError && err.code === 'UNAUTHENTICATED') {
          localStorage.removeItem('token');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string) {
    const data = await gql<{ login: { token: string; user: User } }>(
      `mutation Login($u: String!, $p: String!) {
        login(username: $u, password: $p) { token user { ${USER_FIELDS} } }
      }`,
      { u: username, p: password },
    );
    localStorage.setItem('token', data.login.token);
    setUser(data.login.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}