import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SecurityTest() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [results,  setResults]  = useState([]);
  const [running,  setRunning]  = useState(false);

  const tests = [
    {
      id:1, name:'Backend health check', desc:'Verify Node.js server is running', category:'System',
      run: async () => {
        const res  = await fetch('http://localhost:5000/api/health');
        const data = await res.json();
        return { passed:res.status===200, expected:'200 OK', got:`${res.status} — ${data.status}`, detail:'Node.js + Express backend operational' };
      },
    },
    {
      id:2, name:'ML API health check', desc:'Verify ML anomaly detection service is running', category:'System',
      run: async () => {
        try {
          const res  = await fetch('http://localhost:5001/health');
          const data = await res.json();
          return { passed:res.status===200, expected:'200 OK', got:`${res.status} — ${data.model}`, detail:'Isolation Forest model loaded and ready' };
        } catch {
          return { passed:false, expected:'200 OK', got:'Connection refused', detail:'Make sure python app.py is running on port 5001' };
        }
      },
    },
    {
      id:3, name:'No token access', desc:'Try to access EHR without JWT token', category:'Authentication',
      run: async () => {
        const res = await fetch('http://localhost:5000/api/ehr/1');
        return { passed:res.status===401, expected:'401 Unauthorized', got:`${res.status}`, detail:'Zero Trust blocked unauthenticated access' };
      },
    },
    {
      id:4, name:'Invalid token', desc:'Try to access with a fake JWT token', category:'Authentication',
      run: async () => {
        const res = await fetch('http://localhost:5000/api/patients', { headers:{ Authorization:'Bearer faketoken123' } });
        return { passed:res.status===401, expected:'401 Unauthorized', got:`${res.status}`, detail:'Policy engine rejected invalid token signature' };
      },
    },
    {
      id:5, name:'ML normal behaviour', desc:'Doctor login at 10am classified as normal', category:'ML Detection',
      run: async () => {
        const res  = await fetch('http://localhost:5001/predict', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ role:'doctor', login_hour:10, ip_known:1, request_count:5, resource:'/api/ehr', session_duration:30, failed_attempts:0, device_known:1 }) });
        const data = await res.json();
        return { passed:data.label==='NORMAL', expected:'NORMAL', got:data.label, detail:`Anomaly score: ${data.anomaly_score}` };
      },
    },
    {
      id:6, name:'ML anomaly detection', desc:'Brute force attack at 3am flagged', category:'ML Detection',
      run: async () => {
        const res  = await fetch('http://localhost:5001/predict', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ role:'doctor', login_hour:3, ip_known:0, request_count:350, resource:'/api/admin', session_duration:1, failed_attempts:8, device_known:0 }) });
        const data = await res.json();
        return { passed:data.label==='ANOMALY', expected:'ANOMALY', got:data.label, detail:`Risk level: ${data.risk_level} · Score: ${data.anomaly_score}` };
      },
    },
  ];

  async function runAllTests() {
    setRunning(true);
    setResults([]);
    for (const test of tests) {
      setResults(prev => [...prev, { ...test, running:true, result:null }]);
      try {
        const result = await test.run();
        setResults(prev => prev.map(r => r.id === test.id ? { ...r, running:false, result } : r));
      } catch (err) {
        setResults(prev => prev.map(r => r.id === test.id ? { ...r, running:false, result:{ passed:false, expected:'Success', got:err.message, detail:'Unexpected error' } } : r));
      }
      await new Promise(res => setTimeout(res, 600));
    }
    setRunning(false);
  }

  const passed   = results.filter(r => r.result?.passed).length;
  const failed   = results.filter(r => r.result && !r.result.passed).length;
  const total    = tests.length;
  const categories = [...new Set(tests.map(t => t.category))];

  return (
    <div style={s.layout}>
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <img src="/images/logo.png" alt="logo" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
          <span style={s.sidebarLogoText}>Security Tests</span>
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
            <h2 style={s.pageTitle}>Security Testing Suite</h2>
            <p style={s.pageSubtitle}>Automated penetration and validation tests</p>
          </div>
          <button onClick={runAllTests} disabled={running} style={s.runAllBtn}>
            {running ? '⏳ Running tests...' : '▶ Run All Tests'}
          </button>
        </div>

        <div style={s.content}>
          {results.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' }}>
              {[
                { label:'Tests Run', value:results.length, color:'#2D7DD2' },
                { label:'Passed',    value:passed,          color:'#10B981' },
                { label:'Failed',    value:failed,          color:'#EF4444' },
              ].map((item, i) => (
                <div key={i} style={{ background:'var(--bg-card)', border:`1px solid ${item.color}33`, borderRadius:'12px', padding:'20px', textAlign:'center' }}>
                  <div style={{ fontSize:'32px', fontWeight:'700', color:item.color, fontFamily:'var(--font-heading)' }}>{item.value}</div>
                  <div style={{ fontSize:'13px', color:'var(--text-secondary)', marginTop:'4px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'12px', padding:'20px', marginBottom:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>Test progress</span>
                <span style={{ fontSize:'13px', fontFamily:'var(--font-mono)', color:'var(--text-primary)' }}>{passed}/{total} passing</span>
              </div>
              <div style={{ height:'8px', background:'var(--bg-secondary)', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'4px', width:`${(passed/total)*100}%`, background:'var(--success)', transition:'width 0.5s' }} />
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'12px', padding:'48px', textAlign:'center' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔐</div>
              <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'20px', color:'var(--text-primary)', marginBottom:'8px' }}>Ready to run security tests</h3>
              <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'24px' }}>Click Run All Tests to validate your Zero Trust implementation</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxWidth:'400px', margin:'0 auto' }}>
                {tests.map(t => (
                  <div key={t.id} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 14px', background:'var(--bg-secondary)', borderRadius:'8px', textAlign:'left' }}>
                    <span style={{ color:'#2D7DD2' }}>◈</span>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'500', color:'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontSize:'11px', color:'var(--text-secondary)' }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && categories.map(cat => (
            <div key={cat} style={{ background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'12px', padding:'24px', marginBottom:'16px' }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'15px', fontWeight:'600', color:'var(--text-primary)', marginBottom:'16px' }}>{cat}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {results.filter(r => r.category === cat).map(test => (
                  <div key={test.id} style={{ display:'flex', gap:'14px', alignItems:'flex-start', padding:'14px 16px', background:'var(--bg-secondary)', border: test.result ? `1px solid ${test.result.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` : '1px solid var(--border-dark)', borderRadius:'10px' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', background: test.running ? 'rgba(245,158,11,0.15)' : test.result ? (test.result.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'var(--bg-secondary)' }}>
                      {test.running ? '⏳' : test.result ? (test.result.passed ? '✓' : '✗') : '○'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'14px', fontWeight:'500', color:'var(--text-primary)', marginBottom:'2px' }}>{test.name}</div>
                      <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginBottom:'6px' }}>{test.desc}</div>
                      {test.result && (
                        <div style={{ display:'flex', gap:'16px', fontSize:'12px', fontFamily:'var(--font-mono)' }}>
                          <span style={{ color:'var(--text-muted)' }}>Expected: <span style={{ color:'var(--text-secondary)' }}>{test.result.expected}</span></span>
                          <span style={{ color:'var(--text-muted)' }}>Got: <span style={{ color: test.result.passed ? 'var(--success)' : 'var(--danger)' }}>{test.result.got}</span></span>
                        </div>
                      )}
                      {test.result && <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px' }}>{test.result.detail}</div>}
                    </div>
                    {test.result && (
                      <div style={{ fontSize:'12px', fontFamily:'var(--font-mono)', fontWeight:'600', color: test.result.passed ? 'var(--success)' : 'var(--danger)', flexShrink:0 }}>
                        {test.result.passed ? 'PASS' : 'FAIL'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  layout:       { display:'flex', minHeight:'100vh', background:'var(--bg-primary)' },
  sidebar:      { width:'200px', background:'var(--bg-card)', borderRight:'1px solid var(--border-dark)', display:'flex', flexDirection:'column', padding:'24px 16px', flexShrink:0 },
  sidebarLogo:  { display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' },
  sidebarLogoText:{ fontFamily:'var(--font-heading)', fontSize:'14px', fontWeight:'700', color:'var(--text-primary)' },
  backBtn:      { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'var(--accent-glow)', border:'1px solid var(--border-hover)', color:'var(--accent-bright)', fontSize:'13px', cursor:'pointer', width:'100%', marginBottom:'4px' },
  logoutBtn:    { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#FCA5A5', fontSize:'13px', cursor:'pointer', width:'100%' },
  main:         { flex:1, display:'flex', flexDirection:'column' },
  topbar:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 32px', borderBottom:'1px solid var(--border-dark)', background:'var(--bg-card)' },
  pageTitle:    { fontFamily:'var(--font-heading)', fontSize:'22px', fontWeight:'700', color:'var(--text-primary)' },
  pageSubtitle: { fontSize:'13px', color:'var(--text-secondary)', marginTop:'2px', fontFamily:'var(--font-mono)' },
  runAllBtn:    { padding:'12px 24px', background:'#10B981', border:'none', borderRadius:'10px', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' },
  content:      { flex:1, padding:'32px', overflowY:'auto' },
};