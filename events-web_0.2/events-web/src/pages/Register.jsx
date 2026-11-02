import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { leerError } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import AuthLayout from '../components/AuthLayout.jsx';
import FormField from '../components/FormField.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validar = (v) => ({
  nombre: v.nombre.trim().length < 3 ? 'Ingresa tu nombre completo (mínimo 3 letras).' : '',
  correo: !v.correo.trim() ? 'Ingresa tu correo.' : !EMAIL_RE.test(v.correo.trim()) ? 'Ingresa un correo válido.' : '',
  password: v.password.length < 8 ? 'La contraseña debe tener al menos 8 caracteres.' : '',
  confirmar: v.confirmar !== v.password ? 'Las contraseñas no coinciden.' : '',
});

export default function Register() {
  usePageTitle('Crear cuenta');
  const { usuario, entrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { valores, errores, onChange, onBlur, validarTodo, ponerErroresServidor } = useForm(
    { nombre: '', correo: '', password: '', confirmar: '' },
    validar
  );
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState('');
  const [verClave, setVerClave] = useState(false);
  const completado = useRef(false); // evita que la redirección automática se cruce con la pantalla de éxito

  if (usuario && !completado.current) return <Navigate to="/eventos" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setAlerta('');
    if (!validarTodo()) return;

    setEnviando(true);
    try {
      const { data } = await api.post('/auth/register', {
        nombre: valores.nombre.trim(),
        correo: valores.correo.trim().toLowerCase(),
        password: valores.password,
      });
      completado.current = true;
      entrar(data.token, data.usuario);
      toast.exito(`Cuenta creada. Bienvenido, ${data.usuario.nombre}.`);
      navigate('/registro/exito', { state: { codigo: data.usuario.codigoEstudiantil } });
    } catch (err) {
      const { mensaje, errores: lista } = leerError(err);
      setAlerta(mensaje);
      ponerErroresServidor(lista);
    } finally {
      setEnviando(false);
    }
  };

  const tipoClave = verClave ? 'text' : 'password';

  return (
    <AuthLayout
      titulo="Crea tu cuenta"
      subtitulo="Solo necesitas tu nombre, un correo y una contraseña. Te asignamos un código de participante."
      pie={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      {alerta && (
        <div className="alerta alerta--error" role="alert">
          <p>{alerta}</p>
        </div>
      )}

      <form onSubmit={enviar} noValidate>
        <FormField id="nombre" label="Nombre completo" autoComplete="name" value={valores.nombre} onChange={onChange} onBlur={onBlur} error={errores.nombre} required />
        <FormField id="correo" label="Correo electrónico" type="email" autoComplete="email" value={valores.correo} onChange={onChange} onBlur={onBlur} error={errores.correo} required />
        <FormField
          id="password"
          label="Contraseña"
          type={tipoClave}
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
          value={valores.password}
          onChange={onChange}
          onBlur={onBlur}
          error={errores.password}
          required
        />
        <FormField id="confirmar" label="Confirmar contraseña" type={tipoClave} autoComplete="new-password" value={valores.confirmar} onChange={onChange} onBlur={onBlur} error={errores.confirmar} required />
        <label className="casilla">
          <input type="checkbox" checked={verClave} onChange={(e) => setVerClave(e.target.checked)} />
          Mostrar contraseñas
        </label>

        <button type="submit" className="btn btn--primario btn--completo" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
