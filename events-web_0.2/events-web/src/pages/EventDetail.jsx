import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { fechaLarga, hoyISO, soloFecha } from '../utils/fechas.js';
import Loader from '../components/Loader.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import FechaBloque from '../components/FechaBloque.jsx';
import Cupo from '../components/Cupo.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const toast = useToast();
  const esAdmin = usuario.rol === 'admin';

  const [estado, setEstado] = useState('cargando');
  const [evento, setEvento] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmar, setConfirmar] = useState(null); // 'cancelar' | 'eliminar' | null

  usePageTitle(evento?.nombre || 'Evento');

  const traer = useCallback(async () => {
    const { data } = await api.get(`/events/${id}`);
    setEvento(data.evento);
  }, [id]);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      await traer();
      setEstado('listo');
    } catch (err) {
      const e = leerError(err);
      setError(e.mensaje);
      setEstado(e.status === 404 ? 'noexiste' : 'error');
    }
  }, [traer]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const inscribirse = async () => {
    setEnviando(true);
    try {
      const { data } = await api.post(`/events/${id}/register`);
      toast.exito(data.mensaje);
      setEvento((e) => ({ ...e, inscrito: true, inscritos: e.inscritos + 1, cupoDisponible: data.cupoDisponible }));
    } catch (err) {
      toast.error(leerError(err).mensaje);
      traer().catch(() => {}); // refresca el cupo por si cambió mientras tanto
    } finally {
      setEnviando(false);
    }
  };

  const cancelarInscripcion = async () => {
    setEnviando(true);
    try {
      const { data } = await api.delete(`/events/${id}/register`);
      toast.exito(data.mensaje);
      setEvento((e) => ({ ...e, inscrito: false, inscritos: e.inscritos - 1, cupoDisponible: e.cupoDisponible + 1 }));
      setConfirmar(null);
    } catch (err) {
      toast.error(leerError(err).mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async () => {
    setEnviando(true);
    try {
      const { data } = await api.delete(`/events/${id}`);
      toast.exito(data.mensaje);
      navigate('/eventos', { replace: true });
    } catch (err) {
      toast.error(leerError(err).mensaje);
      setEnviando(false);
    }
  };

  if (estado === 'cargando') return <Loader texto="Cargando evento…" />;

  if (estado === 'noexiste') {
    return (
      <section className="panel panel--angosto centrado">
        <h1>Este evento no existe</h1>
        <p className="texto-suave">Puede que haya sido eliminado.</p>
        <Link to="/eventos" className="btn btn--primario">
          Ver todos los eventos
        </Link>
      </section>
    );
  }

  if (estado === 'error') {
    return (
      <div className="alerta alerta--error" role="alert">
        <p>{error}</p>
        <button type="button" className="btn btn--secundario" onClick={cargar}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const agotado = evento.cupoDisponible === 0;
  const yaPaso = soloFecha(evento.fecha) < hoyISO();
  const activo = evento.estado === 'activo';
  const puedeInscribirse = activo && !yaPaso;

  return (
    <>
      <Breadcrumbs items={[{ to: '/eventos', texto: 'Eventos' }, { texto: evento.nombre }]} />

      <article className="detalle">
        <header className="detalle__cabecera">
          <FechaBloque fecha={evento.fecha} grande />
          <div>
            <div className="evento__insignias">
              {evento.inscrito && <span className="insignia insignia--exito">✓ Estás inscrito</span>}
              {!activo && <span className="insignia insignia--aviso">Evento {evento.estado}</span>}
              {activo && yaPaso && <span className="insignia insignia--aviso">Ya ocurrió</span>}
            </div>
            <h1>{evento.nombre}</h1>
          </div>
        </header>

        <div className="detalle__info">
          <section aria-labelledby="sobre-el-evento">
            <h2 id="sobre-el-evento">Sobre el evento</h2>
            <p className="descripcion">{evento.descripcion || 'Este evento todavía no tiene descripción.'}</p>
          </section>

          <dl className="datos">
            <div>
              <dt>Fecha</dt>
              <dd>{fechaLarga(evento.fecha)}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>{evento.hora}</dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>{evento.lugar}</dd>
            </div>
          </dl>
        </div>

        <aside className="reserva" aria-labelledby="titulo-reserva">
          <h2 id="titulo-reserva">{esAdmin ? 'Administrar evento' : 'Reserva tu cupo'}</h2>
          <Cupo evento={evento} />

          {esAdmin ? (
            <div className="reserva__acciones">
              <Link to={`/admin/eventos/${id}/editar`} className="btn btn--primario btn--completo">
                Editar evento
              </Link>
              <Link to={`/admin/eventos/${id}/asistentes`} className="btn btn--secundario btn--completo">
                Ver asistentes
              </Link>
              <button type="button" className="btn btn--peligro-suave btn--completo" onClick={() => setConfirmar('eliminar')}>
                Eliminar evento
              </button>
            </div>
          ) : (
            <div className="reserva__acciones">
              {evento.inscrito && !yaPaso && (
                <button type="button" className="btn btn--secundario btn--completo" onClick={() => setConfirmar('cancelar')}>
                  Cancelar inscripción
                </button>
              )}
              {!evento.inscrito && puedeInscribirse && !agotado && (
                <button type="button" className="btn btn--primario btn--completo" onClick={inscribirse} disabled={enviando}>
                  {enviando ? 'Inscribiendo…' : 'Inscribirme'}
                </button>
              )}
              {!evento.inscrito && puedeInscribirse && agotado && (
                <button type="button" className="btn btn--completo" disabled>
                  Cupo agotado
                </button>
              )}
              {!evento.inscrito && !puedeInscribirse && (
                <p className="texto-suave">Este evento ya no admite inscripciones.</p>
              )}
            </div>
          )}
        </aside>
      </article>

      <ConfirmDialog
        abierto={confirmar === 'cancelar'}
        titulo="¿Cancelar tu inscripción?"
        mensaje={`Dejarás de tener un cupo en "${evento.nombre}". Podrás inscribirte de nuevo si todavía hay cupos.`}
        textoConfirmar="Sí, cancelar inscripción"
        peligro
        cargando={enviando}
        onConfirmar={cancelarInscripcion}
        onCancelar={() => setConfirmar(null)}
      />
      <ConfirmDialog
        abierto={confirmar === 'eliminar'}
        titulo="¿Eliminar este evento?"
        mensaje={`Se eliminará "${evento.nombre}" y las ${evento.inscritos} inscripciones que tiene. Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, eliminar evento"
        peligro
        cargando={enviando}
        onConfirmar={eliminar}
        onCancelar={() => setConfirmar(null)}
      />
    </>
  );
}
