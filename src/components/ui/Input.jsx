import './Input.css';

export default function Input({
  label,
  icon,
  error,
  hint,
  suffix,
  className = '',
  ...rest
}) {
  return (
    <label className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && <span className="field__label">{label}</span>}
      <span className="field__control">
        {icon && <i className={`bi ${icon} field__icon`} aria-hidden="true" />}
        <input className="field__input" {...rest} />
        {suffix && <span className="field__suffix">{suffix}</span>}
      </span>
      {error ? (
        <span className="field__msg field__msg--error">{error}</span>
      ) : hint ? (
        <span className="field__msg">{hint}</span>
      ) : null}
    </label>
  );
}
