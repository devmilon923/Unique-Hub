"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, LoginCredentials, authApi } from "@/lib/axios";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or re-validate user profile against backend session cookie
  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await authApi.getProfile();
      const profile = response.data || null;
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // Continuous state verification on reload / initial mount
  useEffect(() => {
    let active = true;

    authApi
      .getProfile()
      .then((res) => {
        if (active) setUser(res.data || null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Authenticate user without full-page re-render flashing
  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    const response = await authApi.login(credentials);
    const loggedInUser = response.data;
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Terminate session and reset user state
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear client state even if logout request fails
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
