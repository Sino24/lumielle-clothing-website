// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import type { ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STORAGE_TOKEN = "userToken";
const STORAGE_USER  = "userData";

function readStoredSession(): { token: string; user: User } | null {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const raw   = localStorage.getItem(STORAGE_USER);
    if (!token || !raw) return null;
    const user = JSON.parse(raw) as User;
    return { token, user };
  } catch {
    return null;
  }
}

function writeSession(token: string, user: User) {
  localStorage.setItem(STORAGE_TOKEN, token);
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  // keep legacy key clean too
  localStorage.removeItem("userName");
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Initialise state directly from localStorage — no async, no flicker.
  const stored = readStoredSession();
  const [user,    setUser]    = useState<User | null>(stored?.user  ?? null);
  const [token,   setToken]   = useState<string | null>(stored?.token ?? null);
  // loading=true only when we actually have a token to validate
  const [loading, setLoading] = useState<boolean>(!!stored);

  // ── Background token validation ──────────────────────────────────────────
  // We already restored the user from localStorage so the UI is not blocked.
  // This runs silently: if the token is still valid we optionally refresh the
  // user object; if it is truly expired / revoked we log out gracefully.
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("token_invalid");
        return r.json();
      })
      .then((freshUser: User) => {
        if (cancelled) return;
        // Refresh user data in state + storage with the latest from server
        setUser(freshUser);
        writeSession(storedToken, freshUser);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Only clear the session when the server explicitly rejects the token.
        // Network errors (offline, server cold-start, CORS) are ignored so the
        // user stays logged in and can retry when connectivity is restored.
        if (err.message === "token_invalid") {
          clearSession();
          setToken(null);
          setUser(null);
        }
        // For any other error: keep the locally-restored session intact.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [API_BASE]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback((newToken: string, newUser: User) => {
    writeSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};