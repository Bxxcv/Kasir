-- =========================================================================
-- Sekolah MVP — Skema database inti (Supabase / Postgres)
-- Cakupan pass ini: fondasi identitas + RBAC (profiles, kelas dasar).
-- Modul lain (absensi, nilai, pembayaran, perpustakaan, ppdb, berita, dst)
-- masing-masing menyusul sebagai migrasi terpisah — lihat README roadmap.
-- =========================================================================

-- 1. Role enum -------------------------------------------------------------
create type public.user_role as enum (
  'siswa',
  'guru',
  'wali_kelas',
  'staff_tu',
  'bendahara',
  'admin',
  'super_admin'
);
-- 'guest' tidak disimpan sebagai role di DB — itu adalah user yang belum login.

-- 2. Kelas (dibutuhkan sebagai referensi profiles.kelas_id) ----------------
create table public.kelas (
  id uuid primary key default gen_random_uuid(),
  nama text not null,              -- contoh: "XII IPA 1"
  tingkat smallint not null,       -- 10, 11, 12
  wali_kelas_id uuid references auth.users(id),
  tahun_ajaran text not null,      -- contoh: "2026/2027"
  created_at timestamptz not null default now()
);

-- 3. Profiles — 1:1 dengan auth.users, sumber kebenaran untuk role --------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'siswa',
  avatar_url text,
  nis_nip text,                    -- Nomor Induk Siswa / Nomor Induk Pegawai
  kelas_id uuid references public.kelas(id),
  created_at timestamptz not null default now()
);

-- 4. Trigger: buat baris profiles otomatis saat user baru sign up ----------
-- Role default diambil dari options.data.role saat signUp(); jika kosong -> 'siswa'.
-- Role di luar {siswa, guru} HARUS dinaikkan manual oleh admin (lihat RLS di bawah),
-- signUp() di aplikasi memang membatasi pilihan publik hanya ke siswa/guru.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'siswa')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Row Level Security ------------------------------------------------
alter table public.profiles enable row level security;
alter table public.kelas enable row level security;

-- Helper: role user yang sedang login (hindari recursive RLS lookup)
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- profiles: setiap user boleh baca profil sendiri
create policy "profil sendiri bisa dibaca"
  on public.profiles for select
  using (id = auth.uid());

-- profiles: admin & super_admin boleh baca semua profil
create policy "admin baca semua profil"
  on public.profiles for select
  using (public.current_role() in ('admin', 'super_admin'));

-- guru & wali_kelas boleh baca profil siswa (untuk kebutuhan nilai/absensi)
create policy "guru baca profil siswa"
  on public.profiles for select
  using (
    public.current_role() in ('guru', 'wali_kelas', 'staff_tu')
    and role = 'siswa'
  );

-- profiles: user boleh update sebagian data dirinya sendiri (bukan role)
create policy "user update profil sendiri"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- profiles: hanya admin/super_admin boleh ubah role siapa pun
create policy "admin ubah role"
  on public.profiles for update
  using (public.current_role() in ('admin', 'super_admin'));

-- kelas: semua user login boleh baca daftar kelas
create policy "kelas terbaca untuk semua yang login"
  on public.kelas for select
  using (auth.role() = 'authenticated');

-- kelas: hanya admin/staff_tu boleh kelola data kelas
create policy "admin kelola kelas"
  on public.kelas for all
  using (public.current_role() in ('admin', 'super_admin', 'staff_tu'))
  with check (public.current_role() in ('admin', 'super_admin', 'staff_tu'));

-- =========================================================================
-- Catatan implementasi:
-- - Tabel berikutnya (siswa detail, guru detail, absensi, nilai, spp,
--   perpustakaan, ppdb, berita, galeri, event, pengumuman, chat, notifikasi)
--   masing-masing punya RLS sendiri mengikuti pola current_role() di atas.
-- - security definer pada current_role()/handle_new_user() sengaja dipakai
--   agar RLS tidak rekursif memanggil dirinya sendiri saat cek role.
-- =========================================================================
