import './EmptyState.css';

export default function EmptyState({ icon = 'bi-inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><i className={`bi ${icon}`} /></div>
      <h4 className="empty-state__title">{title}</h4>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
