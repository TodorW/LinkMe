import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";
import { HelpCategoryId } from "@/constants/theme";
import { hashJMBG } from "@/lib/storage";
import { api } from "@/lib/api";

const USER_STORAGE_KEY = "@linkme_user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateRole: (role: "user" | "volunteer") => Promise<void>;
  updateCategories: (categories: HelpCategoryId[]) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  jmbg: string;
  role: "user" | "volunteer";
  helpCategories: HelpCategoryId[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        try {
          const freshUser = await api.users.get(userData.id);
          setUser(freshUser);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
        } catch {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    if (user) {
      try {
        const freshUser = await api.users.get(user.id);
        setUser(freshUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const loggedInUser = await api.auth.login(email, password);
      setUser(loggedInUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return { success: false, error: message };
    }
  }

  async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const jmbgHash = await hashJMBG(data.jmbg);

      const newUser = await api.auth.register({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        jmbgHash,
        helpCategories: data.helpCategories,
      });

      setUser(newUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return { success: false, error: message };
    }
  }

  async function logout(): Promise<void> {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  async function updateRole(role: "user" | "volunteer"): Promise<void> {
    if (!user) return;
    try {
      const updatedUser = await api.users.update(user.id, { role });
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  }

  async function updateCategories(categories: HelpCategoryId[]): Promise<void> {
    if (!user) return;
    try {
      const updatedUser = await api.users.update(user.id, { helpCategories: categories });
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to update categories:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateRole,
        updateCategories,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
