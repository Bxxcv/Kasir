import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../services/authService";
import { NAV_BY_ROLE } from "../components/dashboard/navConfig";
import { ROLE_LABELS } from "../types/auth";

export function DashboardLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const navItems = profile ? NAV_BY_ROLE[profile.role] : [];

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-paper sm:grid sm:grid-cols-[240px_1fr]">
      <aside className="border-b sm:border-b-0 sm:border-r border-paper-line bg-navy text-paper sm:min-h-screen">
        <div className="px-5 py-5 border-b border-paper/10">
          <span className="font-display text-lg">SMA Negeri Harapan</span>
        </div>

        {/* Signature ID-card motif, reused from the landing hero as the
            dashboard's identity anchor. */}
        <div className="mx-4 mt-4 rounded-xl border border-gold-light/20 bg-navy-light/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold-light">
            {profile ? ROLE_LABELS[profile.role] : ""}
          </p>
          <p className="mt-1 font-display text-sm truncate">{profile?.full_name}</p>
          {profile?.nis_nip && (
            <p className="font-mono text-[10px] text-paper/50">{profile.nis_nip}</p>
          )}
        </div>

        <nav className="mt-4 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dasbor"}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive ? "bg-gold text-navy font-medium" : "text-paper/80 hover:bg-navy-light"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="mx-4 mt-6 mb-4 w-[calc(100%-2rem)] rounded-lg border border-paper/20 py-2 text-sm text-paper/80 hover:bg-navy-light"
        >
          Keluar
        </button>
      </aside>

      <main className="p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  );
}
