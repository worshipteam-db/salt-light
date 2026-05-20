import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Error loading session:", error);
      }

      setUser(data.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthEvent(event ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = !!user;
    const isPasswordRecovery = authEvent === "PASSWORD_RECOVERY";

    return {
      user,
      loading,
      authEvent,
      isPasswordRecovery,

      // Compatibility with old app code
      isLoadingAuth: loading,
      isLoadingPublicSettings: false,
      authChecked: !loading,
      authError: null,
      isAuthenticated,
      checkUserAuth: async () => {},

      // Temporary helper for later
      navigateToLogin: () => {
        window.location.href = "/login";
      },

      signIn: (email, password) =>
        supabase.auth.signInWithPassword({
          email,
          password,
        }),

      signUp: (email, password) =>
        supabase.auth.signUp({
          email,
          password,
        }),

      signOut: () => supabase.auth.signOut(),
    };
  }, [user, loading, authEvent]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}