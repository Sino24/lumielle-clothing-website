// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import type { ReactNode } from "react"; // ✅ type-only import for verbatimModuleSyntax

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

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Restore session
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error("Token invalid");
        }
        return r.json();
      })
      .then((userData) => {
        setToken(storedToken);
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_BASE]);

  // Login
  const login = useCallback(
    (newToken: string, newUser: User) => {
      localStorage.setItem("userToken", newToken);
      localStorage.setItem("userName", newUser.name);

      setToken(newToken);
      setUser(newUser);
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");

    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
};