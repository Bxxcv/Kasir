// Role hierarchy for the school platform (RBAC)
export type Role =
  | "guest"
  | "siswa"
  | "guru"
  | "wali_kelas"
  | "staff_tu"
  | "bendahara"
  | "admin"
  | "super_admin";

export const ROLE_LABELS: Record<Role, string> = {
  guest: "Tamu",
  siswa: "Siswa",
  guru: "Guru",
  wali_kelas: "Wali Kelas",
  staff_tu: "Staff Tata Usaha",
  bendahara: "Bendahara",
  admin: "Admin",
  super_admin: "Super Admin",
};

// Which roles may access the dashboard at all (everyone except guest)
export const AUTHENTICATED_ROLES: Role[] = [
  "siswa",
  "guru",
  "wali_kelas",
  "staff_tu",
  "bendahara",
  "admin",
  "super_admin",
];

export interface Profile {
  id: string; // matches auth.users.id
  full_name: string;
  role: Role;
  avatar_url: string | null;
  nis_nip: string | null; // Nomor Induk Siswa / Nomor Induk Pegawai
  kelas_id: string | null; // relevant for siswa / wali_kelas
  created_at: string;
}

export interface AuthState {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}
