import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { HelpCategoryId } from "@/constants/theme";
import {
  getUser,
  saveUser,
  clearUser,
  hashJMBG,
  checkJMBGExists,
  addJMBGHash,
  updateUserRole as storageUpdateRole,
  updateUserCategories as storageUpdateCategories,
  generateId,
} from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateRole: (role: "user" | "volunteer") => Promise<void>;
  updateCategories: (categories: HelpCategoryId[]) => Promise<void>;
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
      const storedUser = await getUser();
      setUser(storedUser);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, _password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storedUser = await getUser();
      if (storedUser && storedUser.email === email) {
        setUser(storedUser);
        return { success: true };
      }
      return { success: false, error: "Invalid credentials. Please register first." };
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." };
    }
  }

  async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const jmbgHash = await hashJMBG(data.jmbg);
      
      const exists = await checkJMBGExists(jmbgHash);
      if (exists) {
        return { success: false, error: "This ID is already registered. One person, one account." };
      }

      const newUser: User = {
        id: generateId(),
        email: data.email,
        name: data.name,
        role: data.role,
        jmbgHash,
        helpCategories: data.helpCategories,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
      };

      await saveUser(newUser);
      await addJMBGHash(jmbgHash);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed. Please try again." };
    }
  }

  async function logout(): Promise<void> {
    await clearUser();
    setUser(null);
  }

  async function updateRole(role: "user" | "volunteer"): Promise<void> {
    const updatedUser = await storageUpdateRole(role);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }

  async function updateCategories(categories: HelpCategoryId[]): Promise<void> {
    const updatedUser = await storageUpdateCategories(categories);
    if (updatedUser) {
      setUser(updatedUser);
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
