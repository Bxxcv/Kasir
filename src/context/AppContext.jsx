import { createContext, useContext, useMemo, useState } from 'react';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Siti Rahma',
    role: 'kasir', // admin | kasir | owner
    storeName: 'Toko Berkah Jaya',
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const login = (name, role) => setUser({ name, role, storeName: 'Toko Berkah Jaya' });
  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, login, logout, sidebarCollapsed, setSidebarCollapsed }),
    [user, sidebarCollapsed]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  return useContext(AppCtx);
}
