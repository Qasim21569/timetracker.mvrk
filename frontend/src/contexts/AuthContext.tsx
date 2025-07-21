
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, type UserRole } from '@/data/dummyData'; 
import { useNavigate } from 'react-router-dom';
import { AuthService, ApiError } from '@/services/api';

export type { UserRole } from '@/data/dummyData';


interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const user = await AuthService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          AuthService.logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
    console.log(`Attempting login for: ${email}`);
      await AuthService.login(email, password);
      
      // Get user profile after successful login
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      console.log("Login successful, navigating to /");
      navigate('/');
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
    return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setError(null);
    console.log("Logged out, navigating to /login");
    navigate('/login');
  };

  const isAuthenticated = !!currentUser;
  const userRole = currentUser?.role || null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, userRole, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

