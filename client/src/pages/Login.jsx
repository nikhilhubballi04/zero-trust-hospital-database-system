import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.gridBg} />

      {/* Top Telemetry Header */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={s.statusDot} />
          <span style={s.statusText}>NIST SP 800-207 ZERO TRUST WORKSTATION</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={s.networkTag}>TLS 1.3 ENCRYPTED</span>
          <span style={s.clock}>{time.toLocaleTimeString('en-US', { hour12: false })} IST</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div style={s.cardWrapper}>
        <div style={s.card}>
          
          {/* Header Brand */}
          <div style={s.logoArea}>
            <div style={s.logoBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m-8-8h16" />
              </svg>
            </div>
            <div>
              <h1 style={s.logoTitle}>Mavaji's Hospital</h1>
              <p style={s.logoSub}>CLINICAL WORKSTATION · HIS SECURE PORTAL</p>
            </div>
          </div>

          <div style={s.divider} />

          <div style={{ marginBottom: '22px' }}>
            <h2 style={s.heading}>Staff Authentication</h2>
            <p style={s.subheading}>Enter your clinical credentials to access your authorized department zone.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={s.errorBox}>
              <span style={{ fontSize: '15px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>OFFICIAL EMAIL ADDRESS</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>✉️</span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={s.input} 
                  placeholder="name@hospital.com" 
                  required 
                />
              </div>
            </div>

            <div style={s.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={s.labelNoMargin}>PASSWORD</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={s.togglePassBtn}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>🔒</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  style={s.input} 
                  placeholder="••••••••••••" 
                  required 
                />
              </div>
            </div>

            <button type="submit" style={s.button} disabled={loading}>
              {loading ? 'AUTHENTICATING & VERIFYING...' : 'SIGN IN TO WORKSTATION →'}
            </button>
          </form>

          {/* Footer Return Link */}
          <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => navigate('/')} style={s.backBtn}>
              ← Return to Hospital Website
            </button>
            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              Port 5000 Active
            </span>
          </div>

          <div style={s.securityNotice}>
            <span>🛡️ Continuous Monitoring · All authentication attempts are immutably logged into <code>access_logs</code>.</span>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#070B19',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    color: '#F8FAFC'
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(45, 125, 210, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 125, 210, 0.05) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none'
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(45, 125, 210, 0.15)',
    background: 'rgba(10, 15, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '10px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 10px #10B981'
  },
  statusText: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#34D399',
    letterSpacing: '0.08em',
    fontWeight: '600'
  },
  networkTag: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#60A5FA',
    background: 'rgba(37, 99, 235, 0.15)',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  clock: {
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: '#94A3B8'
  },
  cardWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    zIndex: 2
  },
  card: {
    background: '#0E172A',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '20px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 99, 235, 0.1)'
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px'
  },
  logoBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1E40AF, #0D9488)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(30, 64, 175, 0.4)'
  },
  logoTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.01em'
  },
  logoSub: {
    fontSize: '9px',
    color: '#94A3B8',
    letterSpacing: '0.12em',
    marginTop: '2px',
    fontFamily: 'var(--font-mono)'
  },
  divider: {
    height: '1px',
    background: 'rgba(59, 130, 246, 0.15)',
    marginBottom: '24px'
  },
  heading: {
    fontFamily: 'var(--font-heading)',
    fontSize: '22px',
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: '6px'
  },
  subheading: {
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: '1.5'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '18px',
    fontSize: '13px',
    color: '#FCA5A5'
  },
  field: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#94A3B8',
    letterSpacing: '0.08em',
    marginBottom: '8px',
    fontWeight: '600'
  },
  labelNoMargin: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#94A3B8',
    letterSpacing: '0.08em',
    fontWeight: '600'
  },
  togglePassBtn: {
    background: 'none',
    border: 'none',
    color: '#60A5FA',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    padding: 0
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#131F37',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '10px',
    padding: '0 14px',
    transition: 'border 0.2s'
  },
  inputIcon: {
    fontSize: '14px',
    marginRight: '10px',
    opacity: 0.7
  },
  input: {
    width: '100%',
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
    marginTop: '6px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#60A5FA',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0
  },
  securityNotice: {
    marginTop: '20px',
    padding: '10px 14px',
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '11px',
    color: '#94A3B8',
    lineHeight: '1.5',
    textAlign: 'center'
  }
};