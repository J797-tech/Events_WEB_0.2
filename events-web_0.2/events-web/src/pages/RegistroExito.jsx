import { Link, Navigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function RegistroExito() {
  usePageTitle('Cuenta creada');
  const { state } = useLocation();
  const toast = useToast();

  if (!state?.codigo) return <Navigate to="/eventos" replace />;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(state.codigo);
      toast.exito('Código copiado.');
    } catch {
      toast.error('No pudimos copiar el código. Selecciónalo y cópialo a mano.');
    }
  };

  return (
    <section className="panel panel--angosto centrado">
      <h1>Tu cuenta está lista</h1>
      <p className="texto-suave">Este es tu código de participante. Te identifica en los eventos y en los reportes.</p>

      <div className="codigo">
        <p className="codigo__valor" aria-label={`Tu código es ${state.codigo.split('').join(' ')}`}>
          {state.codigo}
        </p>
        <button type="button" className="btn btn--secundario" onClick={copiar}>
          Copiar código
        </button>
      </div>

      <Link to="/eventos" className="btn btn--primario btn--completo">
        Ver eventos
      </Link>
    </section>
  );
}
