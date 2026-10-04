import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `link mr3 ${isActive ? 'b black' : 'dark-gray'}`;

export default function ProtectedLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <p className="pa4 sans-serif">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="sans-serif">
      <header className="flex flex-wrap items-center justify-between pa3 bb b--light-gray">
        <span className="b mr3">Offcorss Dashboard</span>
        <nav className="flex flex-wrap items-center">
          <NavLink to="/perfil" className={linkClass}>Mi perfil</NavLink>
          <NavLink to="/reporte" className={linkClass}>Reporte</NavLink>
          <span className="mr3 gray">{user.name} {user.lastName}</span>
          <button type="button" onClick={handleLogout} className="pointer ba b--gray bg-white pv1 ph2">
            Salir
          </button>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}