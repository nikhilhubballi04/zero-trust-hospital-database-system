import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { runMLCheck } from '../services/api';

export default function MLDemo() {
  const { logout }   = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    role:'doctor', login_hour:10, ip_known:1,
    request_count:5, resource:'/api/ehr',
    session_duration:30, failed_attempts:0, device_known:1,
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  }

  async function runCheck() {
    setLoading(true);
    try {
      const res = await runMLCheck(form);
      setResult(res.data);
      setHistory(prev => [{
        ...res.data,
        role:     form.role,
        time:     new Date().toLocaleTimeString(),
        resource: form.resource,
        hour:     form.login_hour,
      }, ...prev.slice(0,9)]);
    } catch {
      alert('ML API not running. Make sure python app.py is running on port 5001.');
    } finally {
      setLoading(false);
    }
  }

  function loadScenario(scenario) {
    const scenarios = {
      normal:          { role:'doctor',  login_hour:10, ip_known:1, request_count:5,   resource:'/api/ehr',   session_duration:30, failed_attempts:0, device_known:1 },
      suspicious_time: { role:'doctor',  login_hour:3,  ip_known:1, request_count:5,   resource:'/api/ehr',   session_duration:30, failed_attempts:0, device_known:1 },
      unknown_ip:      { role:'nurse',   login_hour:10, ip_known:0, request_count:8,   resource:'/api/patients', session_duration:20, failed_attempts:0, device_known:0 },
      high_requests:   { role:'admin',   login_hour:14, ip_known:1, request_count:350, resource:'/api/admin', session_duration:5,  failed_attempts:0, device_known:1 },
      brute_force:     { role:'doctor',  login_hour:2,  ip_known:0, request_count:200, resource:'/api/ehr',   session_duration:1,  failed_attempts:8, device_known:0 },
    };
    setForm(scenarios[scenario]);
    setResult(null);
  }

  return (
    <div style={s.layout}>
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <img src="/images/logo.png" alt="logo" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
          <span style={s.sidebarLogoText}>ML Detection</span>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={s.logoutBtn}>⊗ Sign Out</button>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h2 style={s.pageTitle}>ML Anomaly Detection</h2>
            <p style={s.pageSubtitle}>Isolation Forest — real-time behaviour analysis</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:'20px', padding:'6px 14px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#8B5CF6', boxShadow:'0 0 6px #8B5CF6' }} />
            <span style={{ fontSize:'11px', fontFamily:'var(--font-mono)', color:'#8B5CF6', letterSpacing:'0.1em' }}>ML MODEL ACTIVE</span>
          </div>
        </div>

        <div style={s.content}>
          <div style={s.grid}>
            <div>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Quick Test Scenarios</h3>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'16px' }}>Click to auto-fill the form</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {[
                    { key:'normal',          label:'Normal Login',       color:'#10B981', desc:'Doctor, 10am, known IP' },
                    { key:'suspicious_time', label:'Odd Hours Login',    color:'#F59E0B', desc:'Doctor, 3am login' },
                    { key:'unknown_ip',      label:'Unknown IP',         color:'#F59E0B', desc:'Nurse, foreign device' },
                    { key:'high_requests',   label:'High Requests',      color:'#EF4444', desc:'350 requests in 5 min' },
                    { key:'brute_force',     label:'Brute Force Attack', color:'#EF4444', desc:'8 failed attempts, 3am' },
                  ].map(sc => (
                    <button key={sc.key} onClick={() => loadScenario(sc.key)}
                      style={{ background:'transparent', border:`1px solid ${sc.color}44`, borderRadius:'8px', padding:'10px 14px', cursor:'pointer', textAlign:'left', color:sc.color }}>
                      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{sc.label}</div>
                      <div style={{ fontSize:'11px', opacity:0.7 }}>{sc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>Session Parameters</h3>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'16px' }}>Adjust values and run the ML check</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
                  <div>
                    <label style={s.label}>User Role</label>
                    <select name="role" value={form.role} onChange={handle} style={s.input}>
                      {['doctor','nurse','lab_tech','pharmacist','admin','it_security'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Login Hour (0-23)</label>
                    <input type="number" name="login_hour" min="0" max="23" value={form.login_hour} onChange={handle} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>IP Known</label>
                    <select name="ip_known" value={form.ip_known} onChange={handle} style={s.input}>
                      <option value={1}>Known IP (1)</option>
                      <option value={0}>Unknown IP (0)</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Request Count</label>
                    <input type="number" name="request_count" min="1" value={form.request_count} onChange={handle} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Resource Zone</label>
                    <select name="resource" value={form.resource} onChange={handle} style={s.input}>
                      {['/api/ehr','/api/lab','/api/pharmacy','/api/admin','/api/patients'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Session Duration (min)</label>
                    <input type="number" name="session_duration" min="1" value={form.session_duration} onChange={handle} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Failed Attempts</label>
                    <input type="number" name="failed_attempts" min="0" value={form.failed_attempts} onChange={handle} style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Device Known</label>
                    <select name="device_known" value={form.device_known} onChange={handle} style={s.input}>
                      <option value={1}>Known Device (1)</option>
                      <option value={0}>Unknown Device (0)</option>
                    </select>
                  </div>
                </div>
                <button onClick={runCheck} style={s.runBtn} disabled={loading}>
                  {loading ? '⏳ Analysing...' : '▶ Run ML Analysis'}
                </button>
              </div>
            </div>

            <div>
              {result && (
                <div style={{ ...s.card, border: result.is_anomaly ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)', background: result.is_anomaly ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)', marginBottom:'20px' }}>
                  <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ fontSize:'56px', marginBottom:'12px' }}>{result.is_anomaly ? '🚨' : '✅'}</div>
                    <div style={{ fontSize:'28px', fontWeight:'700', fontFamily:'var(--font-heading)', color: result.is_anomaly ? 'var(--danger)' : 'var(--success)', marginBottom:'8px' }}>{result.label}</div>
                    <div style={{ fontSize:'14px', color: result.is_anomaly ? '#FCA5A5' : 'var(--success)', marginBottom:'20px' }}>{result.message}</div>
                    <div style={{ marginBottom:'20px', padding:'0 20px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>Anomaly Score</span>
                        <span style={{ fontSize:'12px', fontFamily:'var(--font-mono)', color:'var(--text-primary)' }}>{result.anomaly_score}</span>
                      </div>
                      <div style={{ height:'8px', background:'var(--bg-secondary)', borderRadius:'4px', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:'4px', width:`${Math.min(Math.abs(result.anomaly_score)*100,100)}%`, background: result.is_anomaly ? 'var(--danger)' : 'var(--success)', transition:'width 0.5s' }} />
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'0 20px' }}>
                      {[
                        { label:'Risk Level', value:result.risk_level,  color: result.is_anomaly ? 'var(--danger)' : 'var(--success)' },
                        { label:'Model',      value:'Isolation Forest',  color:'var(--text-primary)' },
                        { label:'Threshold',  value:'0.5',               color:'var(--text-primary)' },
                        { label:'Decision',   value: result.is_anomaly ? 'BLOCK' : 'ALLOW', color: result.is_anomaly ? 'var(--danger)' : 'var(--success)' },
                      ].map((d, i) => (
                        <div key={i} style={{ background:'var(--bg-secondary)', borderRadius:'8px', padding:'10px 14px', textAlign:'left' }}>
                          <div style={{ fontSize:'11px', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', marginBottom:'4px' }}>{d.label}</div>
                          <div style={{ fontSize:'14px', fontWeight:'600', color:d.color }}>{d.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!result && (
                <div style={{ ...s.card, textAlign:'center', padding:'48px 24px', marginBottom:'20px' }}>
                  <div style={{ fontSize:'48px', marginBottom:'12px' }}>🤖</div>
                  <div style={{ fontSize:'15px', color:'var(--text-secondary)' }}>Select a scenario or fill parameters and click Run ML Analysis</div>
                </div>
              )}

              {history.length > 0 && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Detection History</h3>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'12px' }}>Last {history.length} checks this session</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {history.map((h, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 12px', background:'var(--bg-secondary)', borderRadius:'8px' }}>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', flexShrink:0, background: h.is_anomaly ? 'var(--danger)' : 'var(--success)' }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'13px', fontWeight:'500', color:'var(--text-primary)' }}>{h.role} → {h.resource}</div>
                          <div style={{ fontSize:'11px', color:'var(--text-secondary)', marginTop:'2px' }}>Hour: {h.hour}:00 · Score: {h.anomaly_score}</div>
                        </div>
                        <div style={{ fontSize:'11px', fontFamily:'var(--font-mono)', color: h.is_anomaly ? 'var(--danger)' : 'var(--success)' }}>{h.label}</div>
                        <div style={{ fontSize:'11px', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{h.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  layout:       { display:'flex', minHeight:'100vh', background:'var(--bg-primary)' },
  sidebar:      { width:'220px', background:'var(--bg-card)', borderRight:'1px solid var(--border-dark)', display:'flex', flexDirection:'column', padding:'24px 16px', flexShrink:0 },
  sidebarLogo:  { display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' },
  sidebarLogoText:{ fontFamily:'var(--font-heading)', fontSize:'15px', fontWeight:'700', color:'var(--text-primary)' },
  backBtn:      { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'var(--accent-glow)', border:'1px solid var(--border-hover)', color:'var(--accent-bright)', fontSize:'14px', cursor:'pointer', width:'100%', marginBottom:'4px' },
  logoutBtn:    { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#FCA5A5', fontSize:'14px', cursor:'pointer', width:'100%' },
  main:         { flex:1, display:'flex', flexDirection:'column' },
  topbar:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 32px', borderBottom:'1px solid var(--border-dark)', background:'var(--bg-card)' },
  pageTitle:    { fontFamily:'var(--font-heading)', fontSize:'22px', fontWeight:'700', color:'var(--text-primary)' },
  pageSubtitle: { fontSize:'13px', color:'var(--text-secondary)', marginTop:'2px', fontFamily:'var(--font-mono)' },
  content:      { flex:1, padding:'32px', overflowY:'auto' },
  grid:         { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' },
  card:         { background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'12px', padding:'24px', marginBottom:'20px' },
  cardTitle:    { fontFamily:'var(--font-heading)', fontSize:'16px', fontWeight:'600', color:'var(--text-primary)', marginBottom:'4px' },
  label:        { display:'block', fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'0.05em', marginBottom:'4px' },
  input:        { width:'100%', padding:'8px 12px', background:'var(--bg-secondary)', border:'1px solid var(--border-dark)', borderRadius:'8px', color:'var(--text-primary)', fontSize:'13px' },
  runBtn:       { width:'100%', padding:'12px', background:'#8B5CF6', border:'none', borderRadius:'8px', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' },
};