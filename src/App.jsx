import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Kasir from './pages/Kasir/Kasir';
import Produk from './pages/Produk/Produk';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ui/Toast';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Ringkasan bisnis hari ini' },
  '/kasir': { title: 'Kasir', subtitle: 'Buat transaksi baru' },
  '/produk': { title: 'Manajemen Produk', subtitle: 'Kelola daftar produk dan stok' },
};

function Placeholder({ name }) {
  return (
    <div style={{
      background: 'var(--paper-0)', border: '1px solid var(--line-100)',
      borderRadius: 'var(--r-lg)', padding: 'var(--sp-8)', textAlign: 'center',
      color: 'var(--text-500)',
    }}>
      Halaman <strong>{name}</strong> — bagian dari struktur MVP, siap dikembangkan pada fase berikutnya.
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              <Route element={<AppLayout title={PAGE_META['/dashboard'].title} subtitle={PAGE_META['/dashboard'].subtitle} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route element={<AppLayout title={PAGE_META['/kasir'].title} subtitle={PAGE_META['/kasir'].subtitle} />}>
                <Route path="/kasir" element={<Kasir />} />
              </Route>

              <Route element={<AppLayout title={PAGE_META['/produk'].title} subtitle={PAGE_META['/produk'].subtitle} />}>
                <Route path="/produk" element={<Produk />} />
              </Route>

              <Route element={<AppLayout title="Segera Hadir" subtitle="Halaman ini sedang dikembangkan" />}>
                <Route path="/stok" element={<Placeholder name="Stok" />} />
                <Route path="/pelanggan" element={<Placeholder name="Pelanggan" />} />
                <Route path="/laporan" element={<Placeholder name="Laporan" />} />
                <Route path="/karyawan" element={<Placeholder name="Karyawan" />} />
                <Route path="/pengaturan" element={<Placeholder name="Pengaturan" />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AppProvider>
  );
}
