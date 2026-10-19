// FIELD
//
// The wrapper every form control sits in: label, the control itself, an
// optional hint, and the error message in a fixed place underneath.
//
// The error is announced with role="alert" and tied to the input with
// aria-describedby, so it reaches a screen reader rather than only being red.
// Red alone is not a message.

export default function Field({
  label,
  htmlFor,
  error = '',
  hint = '',
  required = false,
  optional = false,
  children,
  className = '',
}) {
  return (
    <div className={`fld ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="fld-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="fld-req" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (required)</span>}
          {optional && <span className="fld-opt">optional</span>}
        </label>
      )}
      {children}
      {error
        ? <p className="fld-error" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">{error}</p>
        : hint ? <p className="fld-hint">{hint}</p> : null}
    </div>
  );
}
