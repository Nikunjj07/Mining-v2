import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import AdminDashboard from './pages/Dashboard/Admin/AdminDashboard';
import SupervisorDashboard from './pages/Dashboard/Supervisor/SupervisorDashboard';
import RescueDashboard from './pages/Dashboard/Rescue/RescueDashboard';
import ShiftCreate from './pages/Shift/Create/ShiftCreate';
import ShiftHistory from './pages/Shift/History/ShiftHistory';
import Unauthorized from './pages/Unauthorized';
import './App.css';

// Component to handle role-based redirect
function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'supervisor':
      return <Navigate to="/dashboard/supervisor" replace />;
    case 'rescue':
      return <Navigate to="/dashboard/rescue" replace />;
    case 'worker':
      return <Navigate to="/dashboard/supervisor" replace />; // Workers see supervisor view
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Root redirect based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Protected Admin Routes */}
            <Route
              path="/dashboard/admin"
              element={
                // <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
                // </ProtectedRoute>
              }
            />

            {/* Protected Supervisor Routes */}
            <Route
              path="/dashboard/supervisor"
              element={
                // <ProtectedRoute allowedRoles={['supervisor', 'worker']}>
                <SupervisorDashboard />
                // </ProtectedRoute>
              }
            />

            {/* Shift Routes */}
            <Route
              path="/shift/create"
              element={
                <ProtectedRoute allowedRoles={['supervisor', 'worker']}>
                  <ShiftCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shift/history"
              element={
                <ProtectedRoute allowedRoles={['supervisor', 'worker', 'admin']}>
                  <ShiftHistory />
                </ProtectedRoute>
              }
            />

            {/* Protected Rescue Team Routes */}
            <Route
              path="/dashboard/rescue"
              element={
                <ProtectedRoute allowedRoles={['rescue']}>
                  <RescueDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
