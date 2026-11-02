import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Página no encontrada');
  return (
    <section className="panel panel--angosto centrado">
      <h1>No encontramos esta página</h1>
      <p className="texto-suave">La dirección no existe o fue movida.</p>
      <Link to="/eventos" className="btn btn--primario">
        Ir a los eventos
      </Link>
    </section>
  );
}
