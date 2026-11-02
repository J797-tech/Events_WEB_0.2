export default function Loader({ texto = 'Cargando…' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__giro" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}
