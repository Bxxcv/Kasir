import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const pengumuman = [
  { no: "01", judul: "Pembayaran SPP Juli jatuh tempo 25 Juli", tanggal: "18 Jul 2026" },
  { no: "02", judul: "Rapat wali murid kelas XII — Aula Utama", tanggal: "20 Jul 2026" },
  { no: "03", judul: "Pendaftaran ekstrakurikuler dibuka", tanggal: "22 Jul 2026" },
];

const berita = [
  { title: "Tim Robotik Juara 1 Kompetisi Provinsi", excerpt: "Delegasi sekolah membawa pulang piala utama setelah bersaing dengan 40 tim se-provinsi." },
  { title: "Kurikulum Merdeka: Panduan untuk Orang Tua", excerpt: "Ringkasan perubahan sistem penilaian dan cara mendampingi anak di rumah." },
  { title: "Galeri Kegiatan Class Meeting", excerpt: "Dokumentasi keseruan pertandingan antar kelas menjelang libur semester." },
];

export function LandingPage() {
  return (
    <div>
      {/* Hero — the "kartu pelajar" (student ID card) as the page's thesis:
          identity, role, and status are the whole point of this platform. */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid gap-12 sm:grid-cols-2 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-forest">
            Portal Akademik Terpadu
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl leading-tight text-navy">
            Satu identitas, untuk seluruh urusan sekolah.
          </h1>
          <p className="mt-4 text-ink/70 max-w-md">
            Dari absensi harian sampai rapor akhir semester — siswa, guru, dan orang tua
            mengakses data yang sama, secara real-time, dengan hak akses yang jelas untuk
            setiap peran.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/daftar"
              className="rounded-full bg-navy px-6 py-3 text-sm font-medium text-paper hover:bg-navy-light"
            >
              Mulai Sekarang
            </Link>
            <a
              href="#ppdb"
              className="rounded-full border border-navy/20 px-6 py-3 text-sm font-medium text-navy hover:border-navy/40"
            >
              Info PPDB
            </a>
          </div>
        </div>

        {/* Signature element: the ID-card motif, perforated edge, role badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="relative rounded-2xl bg-navy p-6 text-paper shadow-xl">
            <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-paper" />
            <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-paper" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-light">
                Kartu Pelajar
              </span>
              <span className="rounded-full border border-gold-light/40 px-2 py-0.5 font-mono text-[10px] text-gold-light">
                AKTIF
              </span>
            </div>
            <div className="mt-6 h-16 w-16 rounded-full border-2 border-gold-light/60 bg-navy-light" />
            <p className="mt-4 font-display text-xl">Nama Siswa</p>
            <p className="font-mono text-xs text-paper/60">NIS 2026.10.0142 · Kelas XII IPA 1</p>
            <div className="mt-6 border-t border-dashed border-paper/20 pt-3 flex justify-between font-mono text-[10px] text-paper/50">
              <span>SMA NEGERI HARAPAN</span>
              <span>T.A. 2026/2027</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pengumuman — genuinely a ledger: dated, numbered, sequential */}
      <section className="border-y border-paper-line bg-white/50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="font-display text-xl text-navy mb-4">Pengumuman</h2>
          <div>
            {pengumuman.map((p) => (
              <div
                key={p.no}
                className="ledger-rule flex items-center gap-4 py-3 text-sm"
              >
                <span className="font-mono text-gold w-6">{p.no}</span>
                <span className="flex-1 text-ink">{p.judul}</span>
                <span className="font-mono text-xs text-ink/50">{p.tanggal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Berita */}
      <section id="berita" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-navy mb-8">Berita Terbaru</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {berita.map((b) => (
            <article key={b.title} className="rounded-lg border border-paper-line bg-white p-5">
              <div className="mb-3 h-32 rounded bg-paper" />
              <h3 className="font-display text-base text-navy">{b.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{b.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PPDB CTA */}
      <section id="ppdb" className="bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl">Penerimaan Peserta Didik Baru 2027/2028</h2>
            <p className="mt-2 text-paper/70 max-w-md">
              Formulir pendaftaran daring dibuka mulai Januari. Siapkan dokumen dari sekarang.
            </p>
          </div>
          <Link
            to="/daftar"
            className="shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy hover:bg-gold-light"
          >
            Lihat Persyaratan
          </Link>
        </div>
      </section>
    </div>
  );
}
