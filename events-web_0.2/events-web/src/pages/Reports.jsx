import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { descargarCSV } from '../services/descargas.js';
import { useToast } from '../context/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { soloFecha, tituloMes } from '../utils/fechas.js';
import Loader from '../components/Loader.jsx';

export default function Reports() {
  usePageTitle('Reportes');
  const toast = useToast();
  const [estado, setEstado] = useState('cargando');
  const [ocupacion, setOcupacion] = useState(null);
  const [meses, setMeses] = useState([]);
  const [error, setError] = useState('');
  const [separador, setSeparador] = useState('punto_y_coma');
  const [descargando, setDescargando] = useState('');

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const [o, m] = await Promise.all([api.get('/reports/occupancy'), api.get('/reports/events-by-date')]);
      setOcupacion(o.data);
      setMeses(m.data.meses);
      setEstado('listo');
    } catch (err) {
      setError(leerError(err).mensaje);
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const exportar = async (tipo) => {
    setDescargando(tipo);
    try {
      await descargarCSV({ tipo, separador });
      toast.exito('Reporte descargado.');
    } catch (err) {
      toast.error(leerError(err).mensaje);
    } finally {
      setDescargando('');
    }
  };

  if (estado === 'cargando') return <Loader texto="Calculando reportes…" />;
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

  const { resumen, eventos } = ocupacion;
  const maxMes = Math.max(1, ...meses.map((m) => m.total));

  return (
    <section>
      <header className="encabezado">
        <h1>Reportes</h1>
        <p className="texto-suave">Cómo van los cupos y cuántos eventos hay por mes.</p>
      </header>

      {eventos.length === 0 ? (
        <div className="vacio">
          <p className="vacio__titulo">Aún no hay datos para reportar</p>
          <p>Los reportes aparecerán cuando crees eventos y haya inscripciones.</p>
          <Link to="/admin/eventos/nuevo" className="btn btn--primario">
            Crear evento
          </Link>
        </div>
      ) : (
        <>
          <dl className="cifras">
            <div className="cifra">
              <dt>Eventos</dt>
              <dd>{resumen.eventos}</dd>
            </div>
            <div className="cifra">
              <dt>Inscripciones</dt>
              <dd>
                {resumen.inscritosTotal} <small>de {resumen.cupoTotal} cupos</small>
              </dd>
            </div>
            <div className="cifra">
              <dt>Ocupación general</dt>
              <dd>{resumen.porcentajeGlobal}%</dd>
            </div>
          </dl>

          <section className="bloque" aria-labelledby="ocupacion">
            <h2 id="ocupacion">Ocupación por evento</h2>
            <div className="tabla-contenedor">
              <table className="tabla">
                <caption className="visually-hidden">Ocupación de cada evento</caption>
                <thead>
                  <tr>
                    <th scope="col">Evento</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Inscritos</th>
                    <th scope="col">Ocupación</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e) => (
                    <tr key={e.id}>
                      <td data-etiqueta="Evento">
                        <Link to={`/admin/eventos/${e.id}/asistentes`}>{e.nombre}</Link>
                      </td>
                      <td data-etiqueta="Fecha">{soloFecha(e.fecha)}</td>
                      <td data-etiqueta="Inscritos">
                        {e.inscritos} / {e.cupo}
                      </td>
                      <td data-etiqueta="Ocupación">
                        <div className="tabla__barra">
                          <progress
                            className={`cupo${e.porcentaje >= 80 ? ' cupo--critico' : ''}`}
                            value={e.inscritos}
                            max={e.cupo}
                            aria-label={`${e.nombre}: ${e.porcentaje}% ocupado`}
                          />
                          <span>{e.porcentaje}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bloque" aria-labelledby="por-mes">
            <h2 id="por-mes">Eventos por mes</h2>
            <ul className="meses">
              {meses.map((m) => (
                <li key={m.mes}>
                  <span className="meses__nombre">{tituloMes(m.mes)}</span>
                  <progress className="cupo" value={m.total} max={maxMes} aria-label={`${tituloMes(m.mes)}: ${m.total} eventos`} />
                  <span className="meses__total">
                    {m.total} {m.total === 1 ? 'evento' : 'eventos'}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bloque" aria-labelledby="exportar">
            <h2 id="exportar">Exportar a CSV</h2>
            <p className="texto-suave">Archivos que se abren en Excel o Google Sheets.</p>
            <div className="exportar">
              <div className="filtro">
                <label htmlFor="separador">Separador de columnas</label>
                <select id="separador" value={separador} onChange={(e) => setSeparador(e.target.value)}>
                  <option value="punto_y_coma">Punto y coma (Excel en español)</option>
                  <option value="coma">Coma</option>
                </select>
              </div>
              <button type="button" className="btn btn--primario" onClick={() => exportar('ocupacion')} disabled={Boolean(descargando)}>
                {descargando === 'ocupacion' ? 'Descargando…' : 'Reporte de ocupación'}
              </button>
              <button type="button" className="btn btn--secundario" onClick={() => exportar('asistentes')} disabled={Boolean(descargando)}>
                {descargando === 'asistentes' ? 'Descargando…' : 'Todos los asistentes'}
              </button>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
