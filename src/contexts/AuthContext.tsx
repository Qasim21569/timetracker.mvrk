
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, dummyUsers } from '@/data/dummyData'; // Removed UserRole from here as it's defined below
import { useNavigate } from 'react-router-dom';

// Define UserRole here if it's specific to AuthContext or ensure it's imported if defined elsewhere
// For this case, it seems UserRole is also in dummyData.ts. Let's ensure consistency.
// If UserRole from dummyData is the source of truth, import it.
// If AuthContext needs its own, define and export it.
// Assuming UserRole from dummyData.ts is the one we want:
export type { UserRole } from '@/data/dummyData'; // Re-exporting from dummyData

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
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
  const userRole = currentUser?.role || null; // UserRole type will be inferred from currentUser.role

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

