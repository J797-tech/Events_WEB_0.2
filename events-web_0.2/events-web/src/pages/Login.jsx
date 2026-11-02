import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { leerError } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import AuthLayout from '../components/AuthLayout.jsx';
import FormField from '../components/FormField.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validar = (v) => ({
  correo: !v.correo.trim() ? 'Ingresa tu correo.' : !EMAIL_RE.test(v.correo.trim()) ? 'Ingresa un correo válido.' : '',
  password: !v.password ? 'Ingresa tu contraseña.' : '',
});

export default function Login() {
  usePageTitle('Iniciar sesión');
  const { usuario, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { valores, errores, onChange, onBlur, validarTodo, ponerErroresServidor } = useForm(
    { correo: '', password: '' },
    validar
  );
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState('');

  if (usuario) return <Navigate to="/eventos" replace />;

  const desde = location.state?.from?.pathname || '/eventos';

  const enviar = async (e) => {
    e.preventDefault();
    setAlerta('');
    if (!validarTodo()) return;

    setEnviando(true);
    try {
      const u = await login(valores.correo.trim().toLowerCase(), valores.password);
      toast.exito(`Bienvenido, ${u.nombre}.`);
      navigate(desde, { replace: true });
    } catch (err) {
      const { mensaje, errores: lista } = leerError(err);
      setAlerta(mensaje);
      ponerErroresServidor(lista);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Inicia sesión"
      subtitulo="Entra para ver los eventos y reservar tu cupo."
      pie={
        <>
          ¿Primera vez en Events? <Link to="/registro">Crea tu cuenta</Link>
        </>
      }
    >
      {alerta && (
        <div className="alerta alerta--error" role="alert">
          <p>{alerta}</p>
        </div>
      )}

      <form onSubmit={enviar} noValidate>
        <FormField
          id="correo"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={valores.correo}
          onChange={onChange}
          onBlur={onBlur}
          error={errores.correo}
          required
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={valores.password}
          onChange={onChange}
          onBlur={onBlur}
          error={errores.password}
          required
        />
        <button type="submit" className="btn btn--primario btn--completo" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthLayout>
  );
}
