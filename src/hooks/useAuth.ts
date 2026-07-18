import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { getProfile } from "../services/authService";

/**
 * Mounts once (see AppProviders) to keep the auth store in sync with the
 * live Supabase session — handles first load, sign-in, sign-out, token refresh.
 */
export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setSession(session.user.id, session.user.email ?? null);
        const profile = await getProfile(session.user.id);
        setProfile(profile);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setSession(session.user.id, session.user.email ?? null);
        const profile = await getProfile(session.user.id);
        setProfile(profile);
        setStatus("authenticated");
      } else {
        setSession(null, null);
        setProfile(null);
        setStatus("unauthenticated");
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setSession, setProfile, setStatus]);
}

export function useAuth() {
  return useAuthStore((s) => ({
    userId: s.userId,
    email: s.email,
    profile: s.profile,
    status: s.status,
    isAuthenticated: s.status === "authenticated",
  }));
}
