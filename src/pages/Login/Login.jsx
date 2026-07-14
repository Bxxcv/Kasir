import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import './Login.css';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('PIN minimal 4 digit');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      login('Siti Rahma', 'kasir');
      setLoading(false);
      navigate('/dashboard');
    }, 700);
  };

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__brand">
          <div className="login__mark">BJ</div>
          <div>
            <strong>Toko Berkah Jaya</strong>
            <span>Sistem Kasir Digital</span>
          </div>
        </div>

        <div className="login__intro">
          <h1>Masuk ke akun kasir</h1>
          <p>Gunakan PIN yang diberikan pemilik toko untuk mulai bertransaksi.</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <Input
            label="Nomor HP atau Username"
            icon="bi-person"
            placeholder="08xxxxxxxxxx"
            defaultValue="081234567890"
          />
          <Input
            label="PIN Kasir"
            icon="bi-shield-lock"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            error={error}
          />

          <div className="login__row">
            <label className="login__remember">
              <input type="checkbox" defaultChecked /> Ingat perangkat ini
            </label>
            <a href="#" className="login__forgot">Lupa PIN?</a>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Masuk
          </Button>
        </form>

        <p className="login__footnote">
          Bukan kasir? <a href="#">Masuk sebagai Owner / Admin</a>
        </p>
      </div>

      <div className="login__side">
        <div className="login__side-content">
          <span className="login__quote-mark">"</span>
          <p className="login__quote">
            Setiap transaksi tercatat rapi, stok terpantau otomatis, dan laporan
            harian siap dibaca kapan saja — tanpa buku catatan manual.
          </p>
          <div className="login__side-meta">
            <i className="bi bi-patch-check-fill" />
            <span>Dipercaya 1.200+ UMKM di seluruh Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
