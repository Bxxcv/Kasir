# Portal Akademik Sekolah — MVP

Fondasi (Pass 1) dari platform akademik terpadu: **landing page, autentikasi, dashboard shell, dan RBAC** untuk 8 peran. Modul operasional (absensi, nilai, SPP, dll) belum diimplementasikan — sudah direncanakan di roadmap dan sudah punya tempat di routing/sidebar, tinggal diisi.

## 1. Analisis Kebutuhan

| Kebutuhan | Status di Pass 1 |
|---|---|
| Identitas & akses multi-peran (RBAC) | Selesai — 8 role, guard route, RLS Supabase |
| Landing page publik (info sekolah, PPDB, berita) | Selesai (konten statis, siap disambung ke CMS/tabel berita) |
| Login / Register | Selesai (self-register terbatas ke siswa & guru) |
| Dashboard per peran | Shell selesai, widget data masih placeholder |
| Data Siswa, Guru, Kelas, Absensi, Nilai, Rapor, SPP, Perpustakaan, PPDB, Berita, Galeri, Event, Chat, Notifikasi | Belum — lihat Roadmap paragraf 9 |

## 2. Sitemap

```
/                     Landing (publik)
/masuk                Login
/daftar               Register (siswa/guru)
/dasbor               Dashboard (dilindungi, isi berbeda per role)
  /dasbor/jadwal       (siswa, guru)
  /dasbor/nilai        (siswa, guru)
  /dasbor/absensi      (siswa, guru, wali_kelas)
  /dasbor/pembayaran   (siswa, bendahara)
  /dasbor/siswa        (wali_kelas, staff_tu, admin)
  /dasbor/guru         (staff_tu, admin)
  /dasbor/rapor        (wali_kelas)
  /dasbor/ppdb         (staff_tu)
  /dasbor/laporan      (bendahara)
  /dasbor/pengguna     (admin, super_admin)
  /dasbor/konten       (admin)
  /dasbor/analitik     (admin, super_admin)
  /dasbor/pengaturan   (super_admin)
```
Sub-halaman di atas sudah dipetakan di `src/components/dashboard/navConfig.ts` tapi rute & komponennya belum dibuat — tambahkan satu per satu ke `AppRouter.tsx` mengikuti pola `/dasbor`.

## 3. User Flow (autentikasi)

```
Guest -> /daftar -> isi form (peran: siswa/guru) -> Supabase Auth signUp()
      -> trigger DB buat baris profiles (role sesuai pilihan)
      -> email konfirmasi -> /masuk -> signIn()
      -> useAuthListener sinkron session -> fetch profiles
      -> redirect /dasbor -> sidebar & widget menyesuaikan profile.role

Peran lain (wali_kelas, staff_tu, bendahara, admin, super_admin)
      -> dibuat oleh Admin lewat panel Manajemen Pengguna (belum diimplementasikan)
      -> BUKAN lewat /daftar publik
```

## 4. Database Schema & ERD (Pass 1)

```
auth.users (Supabase managed)
     | 1:1
     v
profiles ------------> kelas
 id (PK, = users.id)   id (PK)
 full_name             nama
 role (enum)           tingkat
 avatar_url            wali_kelas_id (FK -> users.id)
 nis_nip               tahun_ajaran
 kelas_id (FK)
 created_at
```

Role enum: `siswa | guru | wali_kelas | staff_tu | bendahara | admin | super_admin`
(`guest` = belum login, tidak disimpan sebagai role).

File lengkap: `supabase/schema.sql` — termasuk trigger auto-create profile dan RLS policy per role.

Tabel modul lanjutan (`siswa_detail`, `guru_detail`, `absensi`, `nilai`, `spp_tagihan`, `buku`, `peminjaman`, `pendaftar_ppdb`, `berita`, `galeri`, `event`, `pengumuman`, `pesan_chat`, `notifikasi`) sengaja belum dibuat — didesain di Roadmap paragraf 9 supaya skema lahir dari kebutuhan modul yang benar-benar dikerjakan, bukan ditebak di awal.

## 5. Folder Structure

```
src/
  components/{ui,auth,dashboard}
  layouts/            PublicLayout, DashboardLayout
  pages/{auth,dashboard,public}
  hooks/              useAuth, useAuthListener
  lib/                supabase.ts
  services/           authService.ts (nanti: siswaService, nilaiService, ...)
  stores/             authStore.ts (Zustand)
  router/             AppRouter.tsx
  types/              auth.ts
  utils/
  assets/
supabase/
  schema.sql
```

## 6. API Design

Pass 1 tidak punya REST/Edge Function custom — semua akses data lewat **Supabase client langsung** (`supabase.from(...).select()`), diamankan oleh RLS, bukan oleh layer API terpisah. Ini pola yang disarankan Supabase untuk MVP: RLS *adalah* authorization layer-nya.

Saat modul butuh logika yang tidak aman dilakukan di client (mis. hitung ulang saldo SPP, generate PDF rapor), itu jadi **Supabase Edge Function**, dipanggil via `supabase.functions.invoke("nama-fungsi")`. Belum ada di Pass 1.

## 7. UI Design

Konsep: **"Buku Induk"** (ledger sekolah) — navy `#16233f` + emas `#b8933f` di atas latar paper dingin `#f2f3ef` (sengaja bukan kombinasi cream+terracotta yang generik). Fraunces untuk heading (karakter institusional), Inter untuk body, IBM Plex Mono untuk data (NIS, tanggal, kode). Elemen tanda tangan: **motif kartu pelajar** (perforated ID card) dipakai konsisten di hero landing dan header sidebar dashboard sebagai penanda identitas & role. Garis ledger (`.ledger-rule`) hanya dipakai untuk konten yang benar-benar tabular (pengumuman bertanggal, nantinya jadwal/nilai/absensi).

## 8. Authentication Flow & Security

- Supabase Auth (email/password) sebagai identity provider.
- `profiles.role` adalah satu-satunya sumber kebenaran RBAC — dibaca lewat `current_role()` (security definer, menghindari RLS rekursif).
- `ProtectedRoute` di client mengecek role untuk UX (redirect cepat), **tapi keamanan sesungguhnya ada di RLS Postgres**, bukan di client.
- Self-registration publik dibatasi ke `siswa`/`guru` di level UI *dan* level DB (kolom `role` di-trigger dari metadata, tapi kenaikan ke role lain hanya lewat policy admin).
- Checklist yang diminta prompt asal (RLS, validasi, rate limit, CSRF, XSS, env vars):
  - RLS: diterapkan di `profiles`, `kelas`.
  - Validasi input: sebagian (HTML5 required/minLength) — validasi skema penuh (mis. Zod) belum ditambahkan.
  - Rate limit, CSRF: ditangani di layer Supabase Auth + Vercel/edge (bukan dikonfigurasi manual di kode Pass 1).
  - XSS: React escaping default + tidak ada `dangerouslySetInnerHTML` di kode ini.
  - Env vars: `.env.example` disediakan, `.env` asli tidak boleh di-commit.

## 9. Roadmap MVP -> Production

**Pass 1 (selesai)** — Landing, Auth, Dashboard shell, RBAC, folder structure.

**Pass 2** — Data Siswa & Guru (CRUD + tabel `kelas` terisi), Manajemen Pengguna admin (naikkan role).

**Pass 3** — Absensi + Jadwal (tabel `jadwal`, `absensi`, ledger-style table view).

**Pass 4** — Nilai + Rapor PDF (tabel `nilai`, generate PDF via Edge Function).

**Pass 5** — Pembayaran SPP (tabel `spp_tagihan`, integrasi payment gateway lokal — perlu keputusan provider).

**Pass 6** — Perpustakaan, PPDB, Berita/Galeri/Event/Pengumuman (CMS ringan di admin panel).

**Pass 7** — Chat realtime (Supabase Realtime) + Notifikasi.

**Pass 8** — PWA, SEO, Analytics, Export PDF/Excel/CSV, hardening (Zod validation, rate limiting eksplisit), testing (Vitest + Playwright), deploy production (Vercel + Supabase project terpisah dev/prod).

## 10. Menjalankan Project

```bash
npm install
cp .env.example .env      # isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY dari project Supabase kamu
# jalankan supabase/schema.sql di SQL Editor project Supabase kamu
npm run dev
```
