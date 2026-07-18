import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../types/auth";

const WIDGETS_INFO: Record<string, { title: string; body: string }[]> = {
  siswa: [
    { title: "Kehadiran Bulan Ini", body: "Modul absensi belum terhubung — akan menampilkan persentase kehadiran real-time." },
    { title: "Nilai Terbaru", body: "Modul nilai belum terhubung — akan menampilkan nilai ujian & tugas terbaru." },
    { title: "Tagihan SPP", body: "Modul pembayaran belum terhubung — akan menampilkan status tagihan bulan berjalan." },
  ],
  guru: [
    { title: "Jadwal Hari Ini", body: "Modul jadwal belum terhubung." },
    { title: "Kelas Perlu Input Nilai", body: "Modul nilai belum terhubung." },
  ],
  wali_kelas: [
    { title: "Ringkasan Kelas", body: "Modul data siswa belum terhubung." },
  ],
  staff_tu: [
    { title: "Pendaftar PPDB Baru", body: "Modul PPDB belum terhubung." },
  ],
  bendahara: [
    { title: "Tunggakan SPP", body: "Modul pembayaran belum terhubung." },
  ],
  admin: [
    { title: "Pengguna Aktif", body: "Modul analitik belum terhubung." },
  ],
  super_admin: [
    { title: "Status Sistem", body: "Modul pengaturan sistem belum terhubung." },
  ],
};

export function DashboardPage() {
  const { profile } = useAuth();
  if (!profile) return null;

  const widgets = WIDGETS_INFO[profile.role] ?? [];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-forest">
        {ROLE_LABELS[profile.role]}
      </p>
      <h1 className="mt-1 font-display text-2xl text-navy">
        Halo, {profile.full_name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Ini fondasi dashboard — modul di bawah akan diisi bertahap sesuai roadmap.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((w) => (
          <div key={w.title} className="rounded-xl border border-paper-line bg-white p-5">
            <h2 className="font-display text-base text-navy">{w.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{w.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
