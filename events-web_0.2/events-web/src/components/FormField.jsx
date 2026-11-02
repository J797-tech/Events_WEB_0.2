// Campo de formulario accesible: label asociada, ayuda y error vinculados con aria-describedby.
// control: 'input' (por defecto), 'textarea' o 'select' (con <option> como hijos).
export default function FormField({ id, label, error, hint, control = 'input', children, ...props }) {
  const Control = control;
  const hintId = hint ? `${id}-ayuda` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p id={hintId} className="campo__ayuda">
          {hint}
        </p>
      )}
      <Control id={id} name={id} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...props}>
        {children}
      </Control>
      {error && (
        <p id={errorId} className="campo__error">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}
