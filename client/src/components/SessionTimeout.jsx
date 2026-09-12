import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SessionTimeout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(120);

  const WARNING_TIME = 780 * 1000;
  const SESSION_TIME = 900 * 1000;

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) return;
    const w = setTimeout(() => setShowWarning(true), WARNING_TIME);
    const s = setTimeout(() => handleLogout(), SESSION_TIME);
    return () => { clearTimeout(w); clearTimeout(s); };
  }, [user, WARNING_TIME, SESSION_TIME, handleLogout]);

  useEffect(() => {
    if (!showWarning) return;
    if (countdown <= 0) { handleLogout(); return; }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [showWarning, countdown, handleLogout]);

  if (!showWarning) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:'16px', padding:'40px', maxWidth:'400px', width:'90%', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>⏳</div>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'22px', fontWeight:'700', color:'var(--text-primary)', marginBottom:'8px' }}>Session Expiring Soon</h2>
        <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'8px' }}>Your session will expire in</p>
        <div style={{ fontSize:'56px', fontWeight:'700', fontFamily:'var(--font-mono)', color:'#F59E0B', marginBottom:'12px' }}>{countdown}s</div>
        <p style={{ fontSize:'12px', color:'var(--text-muted)', lineHeight:'1.6', marginBottom:'24px' }}>Zero Trust policy requires re-authentication every 15 minutes.</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginBottom:'20px' }}>
          <button onClick={handleLogout} style={{ padding:'10px 24px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', color:'var(--danger)', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>Logout Now</button>
          <button onClick={() => { setShowWarning(false); setCountdown(120); }} style={{ padding:'10px 24px', background:'var(--accent-glow)', border:'1px solid var(--border-hover)', borderRadius:'8px', color:'var(--accent-bright)', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>Dismiss</button>
        </div>
        <div style={{ height:'4px', background:'var(--bg-secondary)', borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:'2px', width:`${(countdown/120)*100}%`, background: countdown > 60 ? '#F59E0B' : '#EF4444', transition:'width 1s linear' }} />
        </div>
      </div>
    </div>
  );
}