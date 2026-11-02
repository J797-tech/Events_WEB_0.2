import { useEffect, useId, useRef } from 'react';

// Diálogo de confirmación con <dialog> nativo: bloquea el fondo, atrapa el foco,
// se cierra con Esc y devuelve el foco al botón que lo abrió.
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const ref = useRef(null);
  const idTitulo = useId();
  const idMensaje = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    else if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className="dialogo"
      aria-labelledby={idTitulo}
      aria-describedby={idMensaje}
      onCancel={(e) => {
        e.preventDefault(); // Esc
        if (!cargando) onCancelar();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !cargando) onCancelar(); // clic en el fondo
      }}
    >
      <div className="dialogo__contenido">
        <h2 id={idTitulo}>{titulo}</h2>
        <p id={idMensaje}>{mensaje}</p>
        <div className="dialogo__acciones">
          <button type="button" className="btn btn--secundario" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${peligro ? 'btn--peligro' : 'btn--primario'}`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
