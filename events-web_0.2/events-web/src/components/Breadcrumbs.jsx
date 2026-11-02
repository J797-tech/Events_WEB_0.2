import { Link } from 'react-router-dom';

// Migas de pan: items = [{ to, texto }, ..., { texto }]  (el último no lleva enlace)
export default function Breadcrumbs({ items }) {
  return (
    <nav className="migas" aria-label="Ruta de navegación">
      <ol>
        {items.map((item, i) => (
          <li key={item.texto}>
            {item.to && i < items.length - 1 ? (
              <Link to={item.to}>{item.texto}</Link>
            ) : (
              <span aria-current="page">{item.texto}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
