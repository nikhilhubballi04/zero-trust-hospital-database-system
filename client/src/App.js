import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';
import Home              from './pages/Home';
import Login             from './pages/Login';
import Dashboard         from './pages/Dashboard';
import MLDemo            from './pages/MLDemo';
import SecurityTest      from './pages/SecurityTest';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/dashboard"      element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/ml-demo"        element={
            <ProtectedRoute allowedRoles={['admin','it_security','doctor']}>
              <MLDemo />
            </ProtectedRoute>
          } />
          <Route path="/security-test"  element={
            <ProtectedRoute allowedRoles={['admin','it_security']}>
              <SecurityTest />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}