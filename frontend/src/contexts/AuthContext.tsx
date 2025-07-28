
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
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Checking auth status on page load. Token exists:', !!token);
      
      if (AuthService.isAuthenticated()) {
        try {
          console.log('📡 Validating token with backend...');
          const user = await AuthService.getCurrentUser();
          console.log('✅ Token valid, user authenticated:', user.email);
          setCurrentUser(user);
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          console.log('🧹 Clearing invalid token and redirecting to login');
          
          // Check if it's a network error vs authentication error
          if (error instanceof Error && error.message.includes('Network error')) {
            console.log('🌐 Network error detected, retrying in 2 seconds...');
            // Retry once after a short delay for network issues
            setTimeout(async () => {
              try {
                const user = await AuthService.getCurrentUser();
                console.log('✅ Retry successful, user authenticated:', user.email);
                setCurrentUser(user);
                setLoading(false);
              } catch (retryError) {
                console.error('❌ Retry failed, clearing token:', retryError);
                AuthService.logout();
                setLoading(false);
              }
            }, 2000);
            return; // Don't set loading to false yet
          } else {
            // Authentication error, clear token immediately
            AuthService.logout();
          }
        }
      } else {
        console.log('🚫 No token found, user not authenticated');
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

