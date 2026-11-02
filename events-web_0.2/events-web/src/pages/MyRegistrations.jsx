import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { fechaLocal, hoyISO, soloFecha } from '../utils/fechas.js';
import Loader from '../components/Loader.jsx';
import FechaBloque from '../components/FechaBloque.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Pin, Reloj } from '../components/Iconos.jsx';

function Fila({ inscripcion, onCancelar }) {
  const { evento } = inscripcion;
  return (
    <li className="evento evento--simple">
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
        <p className="evento__dato evento__dato--tenue">Te inscribiste el {fechaLocal(inscripcion.fechaInscripcion)}</p>
        {evento.estado !== 'activo' && <span className="insignia insignia--aviso">Evento {evento.estado}</span>}
      </div>
      {onCancelar && (
        <div className="evento__acciones">
          <button type="button" className="btn btn--secundario" onClick={() => onCancelar(inscripcion)}>
            Cancelar inscripción
          </button>
        </div>
      )}
    </li>
  );
}

export default function MyRegistrations() {
  usePageTitle('Mis inscripciones');
  const toast = useToast();
  const [estado, setEstado] = useState('cargando');
  const [lista, setLista] = useState([]);
  const [error, setError] = useState('');
  const [aCancelar, setACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const { data } = await api.get('/registrations/me');
      setLista(data.inscripciones);
      setEstado('listo');
    } catch (err) {
      setError(leerError(err).mensaje);
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cancelar = async () => {
    setCancelando(true);
    try {
      const { data } = await api.delete(`/events/${aCancelar.evento._id}/register`);
      toast.exito(data.mensaje);
      setLista((l) => l.filter((i) => i.id !== aCancelar.id));
      setACancelar(null);
    } catch (err) {
      toast.error(leerError(err).mensaje);
    } finally {
      setCancelando(false);
    }
  };

  const hoy = hoyISO();
  const proximas = lista.filter((i) => soloFecha(i.evento.fecha) >= hoy);
  const anteriores = lista.filter((i) => soloFecha(i.evento.fecha) < hoy).reverse();

  return (
    <section>
      <header className="encabezado">
        <h1>Mis inscripciones</h1>
        <p className="texto-suave">Los eventos en los que tienes un cupo reservado.</p>
      </header>

      {estado === 'cargando' && <Loader texto="Cargando tus inscripciones…" />}

      {estado === 'error' && (
        <div className="alerta alerta--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--secundario" onClick={cargar}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {estado === 'listo' && lista.length === 0 && (
        <div className="vacio">
          <p className="vacio__titulo">Aún no te has inscrito a ningún evento</p>
          <p>Explora los eventos disponibles y reserva tu primer cupo.</p>
          <Link to="/eventos" className="btn btn--primario">
            Ver eventos
          </Link>
        </div>
      )}

      {estado === 'listo' && proximas.length > 0 && (
        <section className="mes" aria-labelledby="proximas">
          <h2 id="proximas" className="mes__titulo">
            Próximos
          </h2>
          <ul className="agenda">
            {proximas.map((i) => (
              <Fila key={i.id} inscripcion={i} onCancelar={setACancelar} />
            ))}
          </ul>
        </section>
      )}

      {estado === 'listo' && anteriores.length > 0 && (
        <section className="mes" aria-labelledby="anteriores">
          <h2 id="anteriores" className="mes__titulo">
            Anteriores
          </h2>
          <ul className="agenda">
            {anteriores.map((i) => (
              <Fila key={i.id} inscripcion={i} />
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        abierto={Boolean(aCancelar)}
        titulo="¿Cancelar tu inscripción?"
        mensaje={aCancelar ? `Dejarás de tener un cupo en "${aCancelar.evento.nombre}".` : ''}
        textoConfirmar="Sí, cancelar inscripción"
        peligro
        cargando={cancelando}
        onConfirmar={cancelar}
        onCancelar={() => setACancelar(null)}
      />
    </section>
  );
}
