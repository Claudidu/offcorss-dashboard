import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ApiError } from '../api/graphql';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slow, setSlow] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login
  if (user) return <Navigate to="/perfil" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // Si tarda más de 3 s, casi seguro Render está despertando
    const timer = setTimeout(() => setSlow(true), 3000);
    try {
      await login(username.trim(), password);
      navigate('/perfil', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError(err instanceof Error ? err.message : 'Error inesperado');
      }
    } finally {
      clearTimeout(timer);
      setSlow(false);
      setSubmitting(false);
    }
  }

  return (
    <main className="sans-serif pa3 flex justify-center">
      <form onSubmit={handleSubmit} className="w-100 mw6 ba b--light-gray pa4 mt5">
        <h1 className="f3 mt0">Offcorss Dashboard</h1>

        <label htmlFor="username" className="db mb1">Username</label>
        <input
          id="username"
          className="w-100 pa2 mb3 ba b--gray"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password" className="db mb1">Contraseña</label>
        <input
          id="password"
          type="password"
          className="w-100 pa2 mb3 ba b--gray"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p role="alert" className="dark-red mt0">⚠ {error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-100 pa2 ba b--black bg-black white pointer"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>

        {slow && <p className="gray f6">Encendiendo el servidor, unos segundos…</p>}
      </form>
    </main>
  );
}