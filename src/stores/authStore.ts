import { create } from "zustand";
import type { AuthState, Profile } from "../types/auth";

interface AuthStore extends AuthState {
  setSession: (userId: string | null, email: string | null) => void;
  setProfile: (profile: Profile | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  reset: () => void;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  profile: null,
  status: "idle",
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setSession: (userId, email) => set({ userId, email }),
  setProfile: (profile) => set({ profile }),
  setStatus: (status) => set({ status }),
  reset: () => set(initialState),
}));
