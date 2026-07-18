import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dasbor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-forest text-center">
          Portal Akademik
        </p>
        <h1 className="mt-2 font-display text-2xl text-navy text-center">Masuk ke akun kamu</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-ink/70 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm focus-visible:border-gold"
              placeholder="nama@sekolah.sch.id"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-ink/70 mb-1">Kata sandi</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm focus-visible:border-gold"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-navy py-2.5 text-sm font-medium text-paper hover:bg-navy-light disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Belum punya akun?{" "}
          <Link to="/daftar" className="text-navy underline underline-offset-2">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
