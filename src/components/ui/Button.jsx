import './Button.css';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md', // sm | md | lg
  icon,
  iconOnly = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  ...rest
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${iconOnly ? 'btn--icon-only' : ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {icon && <i className={`bi ${icon} btn__icon`} aria-hidden="true" />}
          {!iconOnly && children}
        </>
      )}
    </button>
  );
}
