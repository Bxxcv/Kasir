import type { Role } from "../../types/auth";

export interface NavItem {
  label: string;
  path: string;
}

// What each role sees in the sidebar. Extend as each module (Data Siswa,
// Absensi, Nilai, SPP, ...) gets its own route in a later pass.
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  guest: [],
  siswa: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Jadwal", path: "/dasbor/jadwal" },
    { label: "Nilai", path: "/dasbor/nilai" },
    { label: "Absensi", path: "/dasbor/absensi" },
    { label: "Pembayaran SPP", path: "/dasbor/pembayaran" },
  ],
  guru: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Jadwal Mengajar", path: "/dasbor/jadwal" },
    { label: "Input Nilai", path: "/dasbor/nilai" },
    { label: "Absensi Kelas", path: "/dasbor/absensi" },
  ],
  wali_kelas: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Data Siswa Kelas", path: "/dasbor/siswa" },
    { label: "Rapor", path: "/dasbor/rapor" },
    { label: "Absensi Kelas", path: "/dasbor/absensi" },
  ],
  staff_tu: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Data Siswa", path: "/dasbor/siswa" },
    { label: "Data Guru", path: "/dasbor/guru" },
    { label: "PPDB", path: "/dasbor/ppdb" },
  ],
  bendahara: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Pembayaran SPP", path: "/dasbor/pembayaran" },
    { label: "Laporan Keuangan", path: "/dasbor/laporan" },
  ],
  admin: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Manajemen Pengguna", path: "/dasbor/pengguna" },
    { label: "Data Siswa", path: "/dasbor/siswa" },
    { label: "Data Guru", path: "/dasbor/guru" },
    { label: "Berita & Pengumuman", path: "/dasbor/konten" },
    { label: "Analitik", path: "/dasbor/analitik" },
  ],
  super_admin: [
    { label: "Ringkasan", path: "/dasbor" },
    { label: "Manajemen Pengguna", path: "/dasbor/pengguna" },
    { label: "Pengaturan Sistem", path: "/dasbor/pengaturan" },
    { label: "Analitik", path: "/dasbor/analitik" },
  ],
};
