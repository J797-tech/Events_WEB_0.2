import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { hoyISO } from '../utils/fechas.js';
import Loader from '../components/Loader.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import FormField from '../components/FormField.jsx';

const VACIO = { nombre: '', descripcion: '', fecha: '', hora: '', lugar: '', cupo: '', estado: 'activo' };

const validarCon = (editando) => (v) => ({
  nombre: !v.nombre.trim()
    ? 'Escribe el nombre del evento.'
    : v.nombre.trim().length > 120
      ? 'El nombre no puede superar 120 caracteres.'
      : '',
  fecha: !v.fecha ? 'Elige la fecha.' : !editando && v.fecha < hoyISO() ? 'Elige una fecha de hoy en adelante.' : '',
  hora: !v.hora ? 'Elige la hora.' : '',
  lugar: !v.lugar.trim() ? 'Escribe el lugar del evento.' : '',
  cupo: !/^\d+$/.test(String(v.cupo)) || Number(v.cupo) < 1 ? 'El cupo debe ser un número entero de 1 o más.' : '',
});

export default function EventFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  usePageTitle(editando ? 'Editar evento' : 'Crear evento');

  const navigate = useNavigate();
  const toast = useToast();
  const { valores, errores, onChange, onBlur, validarTodo, ponerErroresServidor, reiniciar } = useForm(
    VACIO,
    validarCon(editando)
  );
  const [estado, setEstado] = useState(editando ? 'cargando' : 'listo');
  const [errorCarga, setErrorCarga] = useState('');
  const [inscritos, setInscritos] = useState(0);
  const [nombreOriginal, setNombreOriginal] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState('');

  // Al editar, carga los datos actuales del evento
  useEffect(() => {
    if (!editando) return;
    let activo = true;
    api
      .get(`/events/${id}`)
      .then(({ data }) => {
        if (!activo) return;
        const e = data.evento;
        reiniciar({
          nombre: e.nombre,
          descripcion: e.descripcion || '',
          fecha: e.fecha.slice(0, 10),
          hora: e.hora,
          lugar: e.lugar,
          cupo: String(e.cupo),
          estado: e.estado,
        });
        setInscritos(e.inscritos);
        setNombreOriginal(e.nombre);
        setEstado('listo');
      })
      .catch((err) => {
        if (!activo) return;
        setErrorCarga(leerError(err).mensaje);
        setEstado('error');
      });
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const enviar = async (e) => {
    e.preventDefault();
    setAlerta('');
    if (!validarTodo()) return;

    const cuerpo = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      fecha: valores.fecha,
      hora: valores.hora,
      lugar: valores.lugar.trim(),
      cupo: Number(valores.cupo),
    };
    if (editando) cuerpo.estado = valores.estado;

    setEnviando(true);
    try {
      const { data } = editando ? await api.put(`/events/${id}`, cuerpo) : await api.post('/events', cuerpo);
      toast.exito(data.mensaje);
      navigate(`/eventos/${editando ? id : data.evento._id}`);
    } catch (err) {
      const { mensaje, errores: lista } = leerError(err);
      setAlerta(mensaje);
      ponerErroresServidor(lista);
    } finally {
      setEnviando(false);
    }
  };

  if (estado === 'cargando') return <Loader texto="Cargando evento…" />;
  if (estado === 'error') {
    return (
      <div className="alerta alerta--error" role="alert">
        <p>{errorCarga}</p>
        <Link to="/eventos" className="btn btn--secundario">
          Volver a los eventos
        </Link>
      </div>
    );
  }

  const migas = editando
    ? [{ to: '/eventos', texto: 'Eventos' }, { to: `/eventos/${id}`, texto: nombreOriginal }, { texto: 'Editar' }]
    : [{ to: '/eventos', texto: 'Eventos' }, { texto: 'Crear evento' }];

  return (
    <section>
      <Breadcrumbs items={migas} />

      <div className="panel panel--formulario">
        <h1>{editando ? 'Editar evento' : 'Crear evento'}</h1>
        <p className="texto-suave">Todos los campos son obligatorios, salvo la descripción.</p>

        {alerta && (
          <div className="alerta alerta--error" role="alert">
            <p>{alerta}</p>
          </div>
        )}

        <form onSubmit={enviar} noValidate>
          <FormField id="nombre" label="Nombre del evento" value={valores.nombre} onChange={onChange} onBlur={onBlur} error={errores.nombre} maxLength={120} required />
          <FormField
            id="descripcion"
            label="Descripción (opcional)"
            control="textarea"
            rows={4}
            hint="Cuenta de qué trata el evento y qué deben llevar los asistentes."
            value={valores.descripcion}
            onChange={onChange}
            onBlur={onBlur}
          />

          <div className="campos-fila">
            <FormField id="fecha" label="Fecha" type="date" value={valores.fecha} onChange={onChange} onBlur={onBlur} error={errores.fecha} min={editando ? undefined : hoyISO()} required />
            <FormField id="hora" label="Hora" type="time" value={valores.hora} onChange={onChange} onBlur={onBlur} error={errores.hora} required />
          </div>

          <FormField id="lugar" label="Lugar" value={valores.lugar} onChange={onChange} onBlur={onBlur} error={errores.lugar} required />

          <div className="campos-fila">
            <FormField
              id="cupo"
              label="Cupo máximo"
              type="number"
              inputMode="numeric"
              min={Math.max(1, inscritos)}
              step={1}
              hint={editando && inscritos > 0 ? `Ya hay ${inscritos} inscritos: el cupo no puede ser menor.` : undefined}
              value={valores.cupo}
              onChange={onChange}
              onBlur={onBlur}
              error={errores.cupo}
              required
            />
            {editando && (
              <FormField id="estado" label="Estado" control="select" value={valores.estado} onChange={onChange} hint="Solo los eventos activos admiten inscripciones.">
                <option value="activo">Activo</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
              </FormField>
            )}
          </div>

          <div className="formulario__acciones">
            <Link to={editando ? `/eventos/${id}` : '/eventos'} className="btn btn--secundario">
              Cancelar
            </Link>
            <button type="submit" className="btn btn--primario" disabled={enviando}>
              {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
