import { Link } from 'react-router-dom';
import FechaBloque from './FechaBloque.jsx';
import Cupo from './Cupo.jsx';
import { Pin, Reloj } from './Iconos.jsx';

// Una fila de la agenda. Todo el bloque es clicable (el enlace del título se extiende con CSS).
export default function EventRow({ evento, esAdmin }) {
  return (
    <li className="evento">
      <FechaBloque fecha={evento.fecha} />

      <div className="evento__cuerpo">
        <h3 className="evento__titulo">
          <Link to={`/eventos/${evento._id}`}>{evento.nombre}</Link>
        </h3>
        <p className="evento__dato">
          <Reloj />
          <span className="visually-hidden">Hora:</span> {evento.hora}
        </p>
        <p className="evento__dato">
          <Pin />
          <span className="visually-hidden">Lugar:</span> {evento.lugar}
        </p>
      </div>

      <div className="evento__estado">
        <div className="evento__insignias">
          {evento.inscrito && <span className="insignia insignia--exito">✓ Inscrito</span>}
          {esAdmin && evento.estado !== 'activo' && <span className="insignia insignia--aviso">{evento.estado}</span>}
        </div>
        <Cupo evento={evento} />
      </div>
    </li>
  );
}
