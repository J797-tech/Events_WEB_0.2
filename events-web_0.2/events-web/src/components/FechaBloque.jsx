import { diaYSemana, fechaLarga, soloFecha } from '../utils/fechas.js';

// Bloque con el día y el día de la semana: la pieza visual central de la agenda
export default function FechaBloque({ fecha, grande = false }) {
  const { dia, semana } = diaYSemana(fecha);
  return (
    <time className={`fecha${grande ? ' fecha--grande' : ''}`} dateTime={soloFecha(fecha)}>
      <span className="visually-hidden">{fechaLarga(fecha)}</span>
      <span className="fecha__dia" aria-hidden="true">
        {dia}
      </span>
      <span className="fecha__semana" aria-hidden="true">
        {semana}
      </span>
    </time>
  );
}
