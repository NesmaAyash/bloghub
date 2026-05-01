import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services';
import { toast } from 'sonner@2.0.3';

// ==================== TYPES ====================

export type UserRole = 'visitor' | 'author' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser && authService.isAuthenticated()) {
          // Convert backend user format to our User type
          const mappedUser: User = {
            id: storedUser.id,
            name: storedUser.name,
            email: storedUser.email,
           
            role: (storedUser.role ?? 'author').toLowerCase() as UserRole,
            avatar: storedUser.avatar,
            bio: storedUser.bio,
          };
          setUser(mappedUser);
          
          // Optionally verify token with backend
          try {
            const currentUser = await authService.getCurrentUser();
            const verifiedUser: User = {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              // ✅ بعد
              role: (currentUser.role ?? 'author').toLowerCase() as UserRole,
              avatar: currentUser.avatar,
              bio: currentUser.bio,
            };
            setUser(verifiedUser);
          } catch (error) {
            // Token invalid, clear user
            setUser(null);
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      // Map backend user to our User type
     const mappedUser: User = {
  id: String(response.id),
  name: response.name,
  email: response.email,
  role: (response.role ?? 'author').toLowerCase() as UserRole,
  avatar: response.avatar,
  bio: response.bio,
};
      
      setUser(mappedUser);
      toast.success(`Welcome back, ${mappedUser.name}!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
    }
  };

const register = async (name: string, email: string, password: string): Promise<void> => {
  try {
    setIsLoading(true);
    await authService.register({
      name,
      email,
      password,
      confirmPassword: password,
    });
    
    // بعد التسجيل، سجّل دخول تلقائياً
    await login(email, password);
    toast.success(`Welcome, ${name}!`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    toast.error(errorMessage);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      // Optimistically update UI
      setUser({ ...user, ...updates });
      
      // Call backend API
      // Note: You'll need to implement the actual API call in userService
      // await userService.updateProfile(user.id, updates);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      // Revert on error
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        const revertedUser: User = {
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role.toLowerCase() as UserRole,
          avatar: storedUser.avatar,
          bio: storedUser.bio,
        };
        setUser(revertedUser);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  const userRole: UserRole = user?.role || 'visitor';

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}