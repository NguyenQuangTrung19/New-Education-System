import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../services/auth.api";
import { tokenStore } from "../services/token";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

type AuthState = {
  user: any | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!tokenStore.getAccessToken();

  const role = useMemo(() => {
    // user data từ /users/me: { id,email,role,... } (theo skeleton)
    return (user?.role as Role) ?? null;
  }, [user]);

  const refreshMe = async () => {
    try {
      const res = await authApi.me();
      if (res.success) setUser(res.data);
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success) throw new Error("Login failed");
    await refreshMe();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    // Khi load app: nếu có access token thì cố lấy user
    (async () => {
      setLoading(true);
      if (tokenStore.getAccessToken()) {
        await refreshMe();
      }
      setLoading(false);
    })();
  }, []);

  const value: AuthState = {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
