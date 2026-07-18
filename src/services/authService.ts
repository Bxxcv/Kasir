import { supabase } from "../lib/supabase";
import type { Profile, Role } from "../types/auth";

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: Extract<Role, "siswa" | "guru">; // public self-registration is limited;
  // wali_kelas/staff_tu/bendahara/admin/super_admin are promoted by an Admin, not self-registered.
}

export async function signUp({ email, password, fullName, role }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("[authService] gagal ambil profil:", error.message);
    return null;
  }
  return data as Profile;
}
