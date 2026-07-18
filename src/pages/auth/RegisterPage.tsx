import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../../services/authService";

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"siswa" | "guru">("siswa");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({ email, password, fullName, role });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper px-6 text-center">
        <div>
          <h1 className="font-display text-2xl text-navy">Cek email kamu</h1>
          <p className="mt-2 text-sm text-ink/70 max-w-sm">
            Kami sudah mengirim tautan konfirmasi ke {email}. Setelah dikonfirmasi, kamu bisa masuk.
          </p>
          <button
            onClick={() => navigate("/masuk")}
            className="mt-6 rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-paper hover:bg-navy-light"
          >
            Ke halaman masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-forest text-center">
          Portal Akademik
        </p>
        <h1 className="mt-2 font-display text-2xl text-navy text-center">Buat akun baru</h1>
        <p className="mt-1 text-center text-xs text-ink/50">
          Peran lain (wali kelas, staf TU, bendahara, admin) dibuatkan oleh Admin.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm text-ink/70 mb-1">Nama lengkap</label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm focus-visible:border-gold"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-ink/70 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm focus-visible:border-gold"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-ink/70 mb-1">Kata sandi</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm focus-visible:border-gold"
            />
          </div>
          <div>
            <span className="block text-sm text-ink/70 mb-1">Saya mendaftar sebagai</span>
            <div className="flex gap-2">
              {(["siswa", "guru"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm capitalize ${
                    role === r
                      ? "border-navy bg-navy text-paper"
                      : "border-paper-line bg-white text-ink/70"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-navy py-2.5 text-sm font-medium text-paper hover:bg-navy-light disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Sudah punya akun?{" "}
          <Link to="/masuk" className="text-navy underline underline-offset-2">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
