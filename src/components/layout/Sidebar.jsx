import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../data/navConfig';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user?.role));

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__mark">BJ</div>
        {!sidebarCollapsed && (
          <div className="sidebar__brand-text">
            <strong>{user?.storeName || 'Toko Saya'}</strong>
            <span>Kasir Digital</span>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''} ${item.primary ? 'sidebar__link--primary' : ''}`
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <i className={`bi ${item.icon}`} />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        className="sidebar__collapse"
        onClick={() => setSidebarCollapsed((c) => !c)}
        aria-label="Ciutkan sidebar"
      >
        <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
        {!sidebarCollapsed && <span>Ciutkan</span>}
      </button>
    </aside>
  );
}
