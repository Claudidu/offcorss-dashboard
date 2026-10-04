import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ApiError } from '../api/graphql';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slow, setSlow] = useState(false);

  if (user) return <Navigate to="/perfil" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
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
    <main className="min-vh-100 bg-oc-gray flex items-center justify-center pa3">
      <form onSubmit={handleSubmit} className="w-100 mw6 bg-white br3 ba b--light-gray pa4">
        <h1 className="f3 mt0 mb1 oc-navy tracked">OFFCORSS</h1>
        <p className="mt0 mb4 gray">Dashboard de productos</p>

        <label htmlFor="username" className="db mb1 b f6">Username</label>
        <input
          id="username"
          className="field mb3"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password" className="db mb1 b f6">Contraseña</label>
        <div className="relative mb3">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="field"
            style={{ paddingRight: '3rem' }}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
            className="absolute right-0 top-0 h-100 ph3 bn bg-transparent pointer f5"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {error && <p role="alert" className="oc-red mt0">⚠ {error}</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-100">
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>

        {slow && <p className="gray f6">Encendiendo el servidor, unos segundos…</p>}
      </form>
    </main>
  );
}