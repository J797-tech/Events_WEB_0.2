import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

// Sin sesión -> login (recordando a dónde quería ir). Con rol incorrecto -> lista de eventos.
export default function ProtectedRoute({ rol }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Loader texto="Verificando tu sesión…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (rol && usuario.rol !== rol) return <Navigate to="/eventos" replace />;

  return <Outlet />;
}
