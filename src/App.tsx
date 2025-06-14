
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; // Ensure this component is correctly set up if using next-themes
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import IndexPage from "./pages/Index"; // This is now TrackTimePage
import LoginPage from "./pages/Login";
import UserManagementPage from "./pages/UserManagement";
import ProjectManagementPage from "./pages/ProjectManagement";
import ReportsPage from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      {/* Sonner might need ThemeProvider from next-themes if not already handled globally */}
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      <Sonner />
      {/* </ThemeProvider> */}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<IndexPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/projects" element={<ProjectManagementPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
