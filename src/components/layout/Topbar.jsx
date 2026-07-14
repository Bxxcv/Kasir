import { useApp } from '../../context/AppContext';
import './Topbar.css';

const ROLE_LABEL = { admin: 'Admin', kasir: 'Kasir', owner: 'Owner' };

export default function Topbar({ title, subtitle }) {
  const { user } = useApp();

  return (
    <header className="topbar">
      <div className="topbar__title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon-btn" aria-label="Notifikasi">
          <i className="bi bi-bell-fill" />
          <span className="topbar__dot" />
        </button>
        <div className="topbar__user">
          <div className="topbar__avatar">{user?.name?.[0] || '?'}</div>
          <div className="topbar__user-text">
            <strong>{user?.name}</strong>
            <span>{ROLE_LABEL[user?.role]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
