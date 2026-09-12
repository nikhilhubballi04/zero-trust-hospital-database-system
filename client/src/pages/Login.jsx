import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [time,     setTime]     = useState(new Date());
  const { login }  = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.grid} />
      <div style={s.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={s.statusDot} />
          <span style={s.statusText}>SYSTEM ONLINE</span>
        </div>
        <span style={s.clock}>{time.toLocaleTimeString('en-US', { hour12:false })}</span>
      </div>
      <div style={s.card}>
        <div style={s.logoArea}>
          <img src="/images/logo.png" alt="logo"
            style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover' }}
            onError={e => { e.target.style.display='none'; }} />
          <div>
            <h1 style={s.logoTitle}>Mavaji's Hospital</h1>
            <p style={s.logoSub}>Staff Secure Portal</p>
          </div>
        </div>
        <div style={s.divider} />
        <h2 style={s.heading}>Secure Access</h2>
        <p style={s.subheading}>Zero Trust Authentication</p>
        {error && (
          <div style={s.errorBox}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={s.input} placeholder="user@hospital.com" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={s.input} placeholder="••••••••••••" required />
          </div>
          <button type="submit" style={s.button} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>
        <div style={{ marginTop:'16px', textAlign:'center' }}>
          <button onClick={() => navigate('/')} style={s.backBtn}>
            ← Back to Mavaji's Hospital
          </button>
        </div>
        <div style={{ marginTop:'12px', textAlign:'center' }}>
          <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>
            🔒 Zero Trust Architecture · All access logged
          </span>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight:'100vh', background:'var(--bg-primary)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' },
  grid:      { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(45,125,210,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(45,125,210,0.05) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' },
  topbar:    { position:'absolute', top:0, left:0, right:0, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 32px', borderBottom:'1px solid var(--border-dark)', background:'rgba(10,15,30,0.8)', backdropFilter:'blur(10px)' },
  statusDot: { width:'8px', height:'8px', borderRadius:'50%', background:'var(--success)', boxShadow:'0 0 8px var(--success)' },
  statusText:{ fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--success)', letterSpacing:'0.1em' },
  clock:     { fontSize:'13px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)' },
  card:      { background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'420px', position:'relative', zIndex:1 },
  logoArea:  { display:'flex', alignItems:'center', gap:'14px', marginBottom:'24px' },
  logoTitle: { fontFamily:'var(--font-heading)', fontSize:'18px', fontWeight:'700', color:'var(--text-primary)' },
  logoSub:   { fontSize:'12px', color:'var(--text-secondary)', marginTop:'2px' },
  divider:   { height:'1px', background:'var(--border-dark)', marginBottom:'24px' },
  heading:   { fontFamily:'var(--font-heading)', fontSize:'22px', fontWeight:'700', color:'var(--text-primary)', marginBottom:'6px' },
  subheading:{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'24px' },
  errorBox:  { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px', marginBottom:'16px', fontSize:'13px', color:'#FCA5A5' },
  field:     { marginBottom:'16px' },
  label:     { display:'block', fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'0.1em', marginBottom:'8px' },
  input:     { width:'100%', padding:'12px 16px', background:'var(--bg-secondary)', border:'1px solid var(--border-dark)', borderRadius:'8px', color:'var(--text-primary)', fontSize:'14px', outline:'none' },
  button:    { width:'100%', padding:'14px', background:'var(--accent)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:'600', fontFamily:'var(--font-mono)', letterSpacing:'0.1em', cursor:'pointer' },
  backBtn:   { background:'none', border:'none', color:'var(--accent-bright)', fontSize:'13px', cursor:'pointer', textDecoration:'underline' },
};