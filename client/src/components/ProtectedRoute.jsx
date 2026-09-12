import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'var(--bg-card)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'16px', padding:'48px', textAlign:'center', maxWidth:'400px' }}>
          <div style={{ fontSize:'48px', color:'#EF4444', marginBottom:'16px' }}>⊗</div>
          <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'24px', fontWeight:'700', color:'var(--text-primary)', marginBottom:'12px' }}>Access Denied</h2>
          <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'8px' }}>Your role <strong style={{ color:'#EF4444' }}>{user.role}</strong> cannot access this page.</p>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>This attempt has been logged.</p>
        </div>
      </div>
    );
  }
  return children;
}