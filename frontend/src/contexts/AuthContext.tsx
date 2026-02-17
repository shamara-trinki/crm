import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, rolesApi, type Permission } from "@/lib/api";
import { jwtDecode } from "@/lib/jwt";

interface AuthUser {
  userId: number;
  roleId: number;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPermissions = useCallback(async (roleId: number, userId: number) => {
    try {
      const { data: roles } = await rolesApi.list();
      const myRole = roles.find((r) => r.id === roleId);
      const permissions = myRole?.permissions.map((p) => p.code) || [];
      setUser({ userId, roleId, permissions });
    } catch {
      // If can't load roles, set empty permissions
      setUser({ userId, roleId, permissions: [] });
    }
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        // Try refresh
        const { data } = await authApi.refresh();
        localStorage.setItem("accessToken", data.accessToken);
        const newDecoded = jwtDecode(data.accessToken);
        await loadPermissions(newDecoded.roleId, newDecoded.sub);
      } else {
        await loadPermissions(decoded.roleId, decoded.sub);
      }
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
    setLoading(false);
  }, [loadPermissions]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (username: string, password: string) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem("accessToken", data.accessToken);
    const decoded = jwtDecode(data.accessToken);
    await loadPermissions(decoded.roleId, decoded.sub);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const hasPermission = (code: string) => {
    return user?.permissions.includes(code) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
