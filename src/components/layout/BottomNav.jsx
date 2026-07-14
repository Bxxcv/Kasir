import { NavLink } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from '../../data/navConfig';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {BOTTOM_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''} ${item.primary ? 'bottom-nav__link--primary' : ''}`
          }
        >
          <i className={`bi ${item.icon}`} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
