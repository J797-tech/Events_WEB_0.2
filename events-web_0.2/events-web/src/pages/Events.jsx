import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { tituloMes } from '../utils/fechas.js';
import Loader from '../components/Loader.jsx';
import EventRow from '../components/EventRow.jsx';
import { Lupa } from '../components/Iconos.jsx';

const FILTROS_VACIOS = { buscar: '', desde: '', hasta: '', estado: '' };

// Agrupa los eventos (ya ordenados por fecha) por mes: "2026-11" -> [eventos]
function agruparPorMes(eventos) {
  const grupos = new Map();
  eventos.forEach((e) => {
    const clave = e.fecha.slice(0, 7);
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(e);
  });
  return [...grupos.entries()].map(([clave, items]) => ({ clave, titulo: tituloMes(clave), items }));
}

export default function Events() {
  usePageTitle('Eventos');
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'admin';

  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const buscar = useDebounce(filtros.buscar);
  const [estado, setEstado] = useState('cargando');
  const [buscando, setBuscando] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState('');
  const peticion = useRef(0); // para ignorar respuestas viejas si el usuario sigue escribiendo

  const rangoInvalido = Boolean(filtros.desde && filtros.hasta && filtros.desde > filtros.hasta);

  const cargar = useCallback(async () => {
    if (rangoInvalido) return;
    const id = ++peticion.current;
    setBuscando(true);
    try {
      const params = {};
      if (buscar.trim()) params.buscar = buscar.trim();
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      if (esAdmin && filtros.estado) params.estado = filtros.estado;

      const { data } = await api.get('/events', { params });
      if (id !== peticion.current) return;
      setEventos(data.eventos);
      setError('');
      setEstado('listo');
    } catch (err) {
      if (id !== peticion.current) return;
      setError(leerError(err).mensaje);
      setEstado('error');
    } finally {
      if (id === peticion.current) setBuscando(false);
    }
  }, [buscar, filtros.desde, filtros.hasta, filtros.estado, esAdmin, rangoInvalido]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiar = (e) => setFiltros((f) => ({ ...f, [e.target.name]: e.target.value }));
  const hayFiltros = Object.values(filtros).some(Boolean);
  const meses = useMemo(() => agruparPorMes(eventos), [eventos]);

  return (
    <section>
      <header className="portada">
        <div className="portada__texto">
          <h1>Eventos</h1>
          <p>Encuentra qué hay en la universidad y reserva tu cupo en un clic.</p>
          {esAdmin && (
            <Link to="/admin/eventos/nuevo" className="btn btn--dorado">
              Crear evento
            </Link>
          )}
        </div>

        <div className="buscador" role="search">
          <label htmlFor="buscar" className="visually-hidden">
            Buscar eventos por nombre, lugar o descripción
          </label>
          <Lupa />
          <input
            id="buscar"
            name="buscar"
            type="search"
            placeholder="Busca por nombre, lugar o descripción"
            autoComplete="off"
            value={filtros.buscar}
            onChange={cambiar}
          />
        </div>
      </header>

      <div className="filtros">
        <div className="filtro">
          <label htmlFor="desde">Desde</label>
          <input id="desde" name="desde" type="date" value={filtros.desde} onChange={cambiar} />
        </div>
        <div className="filtro">
          <label htmlFor="hasta">Hasta</label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            value={filtros.hasta}
            onChange={cambiar}
            aria-invalid={rangoInvalido ? 'true' : undefined}
            aria-describedby={rangoInvalido ? 'error-rango' : undefined}
          />
        </div>
        {esAdmin && (
          <div className="filtro">
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={filtros.estado} onChange={cambiar}>
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="cancelado">Cancelados</option>
              <option value="finalizado">Finalizados</option>
            </select>
          </div>
        )}
        {hayFiltros && (
          <button type="button" className="btn btn--texto" onClick={() => setFiltros(FILTROS_VACIOS)}>
            Limpiar filtros
          </button>
        )}
      </div>

      {rangoInvalido && (
        <p id="error-rango" className="campo__error">
          <span aria-hidden="true">⚠ </span>La fecha final no puede ser anterior a la inicial.
        </p>
      )}

      {estado === 'cargando' && <Loader texto="Cargando eventos…" />}

      {estado === 'error' && (
        <div className="alerta alerta--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--secundario" onClick={cargar}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {estado === 'listo' && (
        <div aria-busy={buscando} className={buscando ? 'resultados resultados--actualizando' : 'resultados'}>
          <p className="resultado" role="status">
            {eventos.length === 0
              ? ''
              : `${eventos.length} ${eventos.length === 1 ? 'evento' : 'eventos'}${hayFiltros ? ' encontrados' : ''}`}
          </p>

          {eventos.length === 0 && hayFiltros && (
            <div className="vacio">
              <p className="vacio__titulo">No encontramos eventos con esos filtros</p>
              <p>Prueba con otras palabras o amplía el rango de fechas.</p>
              <button type="button" className="btn btn--secundario" onClick={() => setFiltros(FILTROS_VACIOS)}>
                Limpiar filtros
              </button>
            </div>
          )}

          {eventos.length === 0 && !hayFiltros && (
            <div className="vacio">
              <p className="vacio__titulo">Todavía no hay eventos</p>
              {esAdmin ? (
                <>
                  <p>Publica el primero para que los estudiantes puedan inscribirse.</p>
                  <Link to="/admin/eventos/nuevo" className="btn btn--primario">
                    Crear el primer evento
                  </Link>
                </>
              ) : (
                <p>Cuando se publique uno, lo verás aquí.</p>
              )}
            </div>
          )}

          {meses.map((mes) => (
            <section key={mes.clave} className="mes" aria-labelledby={`mes-${mes.clave}`}>
              <h2 id={`mes-${mes.clave}`} className="mes__titulo">
                {mes.titulo}
              </h2>
              <ul className="agenda">
                {mes.items.map((e) => (
                  <EventRow key={e._id} evento={e} esAdmin={esAdmin} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
