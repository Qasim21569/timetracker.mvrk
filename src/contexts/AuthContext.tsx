
import React, { createContext, useState, useContext, ReactNode } from 'react';
// Import UserRole directly here
import { User, dummyUsers, type UserRole } from '@/data/dummyData'; 
import { useNavigate } from 'react-router-dom';

// No need to re-export UserRole separately if it's imported for use within this file
// and other files can import it directly from dummyData.ts or from AuthContext if explicitly exported.
// For clarity and directness, components needing UserRole can import it from dummyData.ts.
// However, ProtectedRoute imports it from AuthContext.tsx, so we should export it.
export type { UserRole } from '@/data/dummyData';


interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null; // UserRole should now be correctly recognized
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, pass: string): Promise<boolean> => {
    console.log(`Attempting login for: ${email}`);
    const user = dummyUsers.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      console.log("Login successful, navigating to /");
      navigate('/');
      return true;
    }
    console.log("Login failed");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    console.log("Logged out, navigating to /login");
    navigate('/login');
  };

  const isAuthenticated = !!currentUser;
  const userRole = currentUser?.role || null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, userRole }}>
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

