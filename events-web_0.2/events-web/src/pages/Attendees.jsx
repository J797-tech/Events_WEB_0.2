import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { descargarCSV } from '../services/descargas.js';
import { useToast } from '../context/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { fechaLocal } from '../utils/fechas.js';
import Loader from '../components/Loader.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Attendees() {
  const { id } = useParams();
  const toast = useToast();
  const [estado, setEstado] = useState('cargando');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [aQuitar, setAQuitar] = useState(null);
  const [quitando, setQuitando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  usePageTitle(datos ? `Asistentes de ${datos.evento.nombre}` : 'Asistentes');

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const { data } = await api.get(`/events/${id}/participants`);
      setDatos(data);
      setEstado('listo');
    } catch (err) {
      setError(leerError(err).mensaje);
      setEstado('error');
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    if (!datos) return [];
    const texto = filtro.trim().toLowerCase();
    if (!texto) return datos.participantes;
    return datos.participantes.filter((p) => `${p.nombre} ${p.correo} ${p.codigoEstudiantil}`.toLowerCase().includes(texto));
  }, [datos, filtro]);

  const quitar = async () => {
    setQuitando(true);
    try {
      const { data } = await api.delete(`/registrations/${aQuitar.inscripcionId}`);
      toast.exito(data.mensaje);
      setDatos((d) => ({
        ...d,
        total: d.total - 1,
        participantes: d.participantes.filter((p) => p.inscripcionId !== aQuitar.inscripcionId),
      }));
      setAQuitar(null);
    } catch (err) {
      toast.error(leerError(err).mensaje);
    } finally {
      setQuitando(false);
    }
  };

  const exportar = async () => {
    setDescargando(true);
    try {
      await descargarCSV({ tipo: 'asistentes', evento: id });
      toast.exito('Lista de asistentes descargada.');
    } catch (err) {
      toast.error(leerError(err).mensaje);
    } finally {
      setDescargando(false);
    }
  };

  if (estado === 'cargando') return <Loader texto="Cargando asistentes…" />;
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

  const { evento, total } = datos;

  return (
    <section>
      <Breadcrumbs
        items={[{ to: '/eventos', texto: 'Eventos' }, { to: `/eventos/${id}`, texto: evento.nombre }, { texto: 'Asistentes' }]}
      />

      <header className="encabezado encabezado--accion">
        <div>
          <h1>Asistentes</h1>
          <p className="texto-suave">
            {evento.nombre}: {total} de {evento.cupo} cupos ocupados.
          </p>
        </div>
        <button type="button" className="btn btn--secundario" onClick={exportar} disabled={descargando || total === 0}>
          {descargando ? 'Descargando…' : 'Exportar a CSV'}
        </button>
      </header>

      {total === 0 ? (
        <div className="vacio">
          <p className="vacio__titulo">Todavía no hay inscritos</p>
          <p>Cuando alguien se inscriba, aparecerá en esta lista.</p>
          <Link to={`/eventos/${id}`} className="btn btn--secundario">
            Volver al evento
          </Link>
        </div>
      ) : (
        <>
          <div className="filtro filtro--ancho">
            <label htmlFor="filtro-asistentes">Buscar en la lista</label>
            <input
              id="filtro-asistentes"
              type="search"
              placeholder="Nombre, correo o código"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              autoComplete="off"
            />
          </div>
          <p className="resultado" role="status">
            {filtro.trim() ? `${visibles.length} de ${total} personas` : ''}
          </p>

          {visibles.length === 0 ? (
            <div className="vacio">
              <p className="vacio__titulo">Nadie coincide con esa búsqueda</p>
            </div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <caption className="visually-hidden">Lista de asistentes de {evento.nombre}</caption>
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Inscripción</th>
                    <th scope="col">
                      <span className="visually-hidden">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.inscripcionId}>
                      <td data-etiqueta="Código" className="tabla__codigo">
                        {p.codigoEstudiantil}
                      </td>
                      <td data-etiqueta="Nombre">{p.nombre}</td>
                      <td data-etiqueta="Correo">{p.correo}</td>
                      <td data-etiqueta="Inscripción">{fechaLocal(p.fechaInscripcion)}</td>
                      <td className="tabla__acciones">
                        <button type="button" className="btn btn--texto btn--pequeno btn--texto-peligro" onClick={() => setAQuitar(p)}>
                          Quitar<span className="visually-hidden"> a {p.nombre}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        abierto={Boolean(aQuitar)}
        titulo="¿Quitar a este participante?"
        mensaje={aQuitar ? `${aQuitar.nombre} dejará de tener un cupo en "${evento.nombre}". Podrá volver a inscribirse si hay cupo.` : ''}
        textoConfirmar="Sí, quitar"
        peligro
        cargando={quitando}
        onConfirmar={quitar}
        onCancelar={() => setAQuitar(null)}
      />
    </section>
  );
}
