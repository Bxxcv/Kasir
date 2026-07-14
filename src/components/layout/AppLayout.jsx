import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Topbar from './Topbar';

export default function AppLayout({ title, subtitle }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar title={title} subtitle={subtitle} />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
