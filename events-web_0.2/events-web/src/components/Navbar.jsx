import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function Marca() {
  return (
    <svg className="navbar__logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <rect x="8" y="10" width="16" height="15" rx="3" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M9 14.5h14M12 7.5v3.5M20 7.5v3.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// Menú según el rol de la persona
const enlacesDe = (rol) =>
  rol === 'admin'
    ? [
        { to: '/eventos', texto: 'Eventos' },
        { to: '/admin/eventos/nuevo', texto: 'Crear evento' },
        { to: '/admin/reportes', texto: 'Reportes' },
      ]
    : [
        { to: '/eventos', texto: 'Eventos' },
        { to: '/mis-inscripciones', texto: 'Mis inscripciones' },
      ];

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);

  // El menú móvil se cierra al cambiar de pantalla
  useEffect(() => setAbierto(false), [pathname]);

  const cerrarSesion = () => {
    logout();
    toast.info('Cerraste sesión.');
    navigate('/login');
  };

  const iniciales = usuario
    ? usuario.nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
    : '';

  return (
    <header className="navbar">
      <div className="navbar__barra contenedor">
        <Link to="/" className="navbar__marca">
          <Marca />
          Events
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto((a) => !a)}
        >
          {abierto ? 'Cerrar menú' : 'Menú'}
        </button>

        <nav id="menu-principal" aria-label="Principal" className={`navbar__menu${abierto ? ' navbar__menu--abierto' : ''}`}>
          <ul>
            {usuario ? (
              enlacesDe(usuario.rol).map((e) => (
                <li key={e.to}>
                  <NavLink to={e.to}>{e.texto}</NavLink>
                </li>
              ))
            ) : (
              <>
                <li>
                  <NavLink to="/login">Iniciar sesión</NavLink>
                </li>
                <li>
                  <Link to="/registro" className="btn btn--primario">
                    Crear cuenta
                  </Link>
                </li>
              </>
            )}
          </ul>

          {usuario && (
            <div className="navbar__usuario">
              <span className="avatar" aria-hidden="true">
                {iniciales}
              </span>
              <span className="navbar__nombre">
                <strong>{usuario.nombre}</strong>
                <small>{usuario.rol === 'admin' ? 'Administrador' : 'Estudiante'}</small>
              </span>
              <button type="button" className="btn btn--texto" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
