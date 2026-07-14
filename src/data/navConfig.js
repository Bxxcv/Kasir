export const NAV_ITEMS = [
  { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard', roles: ['admin', 'owner', 'kasir'] },
  { to: '/kasir', icon: 'bi-cash-coin', label: 'Kasir', roles: ['admin', 'owner', 'kasir'], primary: true },
  { to: '/produk', icon: 'bi-box-seam-fill', label: 'Produk', roles: ['admin', 'owner'] },
  { to: '/stok', icon: 'bi-clipboard-data-fill', label: 'Stok', roles: ['admin', 'owner'] },
  { to: '/pelanggan', icon: 'bi-people-fill', label: 'Pelanggan', roles: ['admin', 'owner', 'kasir'] },
  { to: '/laporan', icon: 'bi-bar-chart-fill', label: 'Laporan', roles: ['admin', 'owner'] },
  { to: '/karyawan', icon: 'bi-person-badge-fill', label: 'Karyawan', roles: ['owner'] },
  { to: '/pengaturan', icon: 'bi-gear-fill', label: 'Pengaturan', roles: ['admin', 'owner'] },
];

// Item prioritas untuk bottom nav mobile (maks 5 agar jempol nyaman)
export const BOTTOM_NAV_ITEMS = [
  { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Beranda' },
  { to: '/kasir', icon: 'bi-cash-coin', label: 'Kasir', primary: true },
  { to: '/produk', icon: 'bi-box-seam-fill', label: 'Produk' },
  { to: '/laporan', icon: 'bi-bar-chart-fill', label: 'Laporan' },
];
