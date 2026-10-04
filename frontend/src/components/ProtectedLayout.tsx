import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `link white pv2 mr4-l ${isActive ? 'b' : 'o-80 hover-white'}`;

export default function ProtectedLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return <p className="pa4">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;

  const closeMenu = () => setMenuOpen(false);

  function handleLogout() {
    closeMenu();
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className="bg-oc-navy white no-print">
        <div className="flex flex-wrap items-center justify-between ph3 pv2">
          <span className="b f5 tracked">
            OFFCORSS <span className="normal o-80">Dashboard</span>
          </span>

          <button
            type="button"
            className="dn-l bn bg-transparent white f3 pointer pa1"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ☰
          </button>

          <nav
            id="menu-principal"
            aria-label="Principal"
            className={`${menuOpen ? 'flex' : 'dn'} flex-l flex-column flex-row-l items-start items-center-l w-100 w-auto-l pv2 pv0-l`}
          >
            <NavLink to="/perfil" className={linkClass} onClick={closeMenu}>Mi perfil</NavLink>
            <NavLink to="/reporte" className={linkClass} onClick={closeMenu}>Reporte</NavLink>
            <span className="pv2 mr4-l o-80">{user.name} {user.lastName}</span>
            <button type="button" onClick={handleLogout} className="btn btn-primary mv2 mv0-l">
              Salir
            </button>
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  );
}