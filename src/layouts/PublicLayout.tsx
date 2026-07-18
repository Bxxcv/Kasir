import { Link, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b border-paper-line bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-gold text-gold font-display text-sm">
              SN
            </span>
            <span className="font-display text-lg tracking-tight">SMA Negeri Harapan</span>
          </Link>
          <nav className="hidden gap-6 text-sm sm:flex">
            <a href="#berita" className="hover:text-gold-light">Berita</a>
            <a href="#ppdb" className="hover:text-gold-light">PPDB</a>
            <a href="#galeri" className="hover:text-gold-light">Galeri</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/masuk" className="hover:text-gold-light">Masuk</Link>
            <Link
              to="/daftar"
              className="rounded-full bg-gold px-4 py-1.5 font-medium text-navy hover:bg-gold-light"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-paper-line bg-navy text-paper/70">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs">
          <p>© {new Date().getFullYear()} SMA Negeri Harapan. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
