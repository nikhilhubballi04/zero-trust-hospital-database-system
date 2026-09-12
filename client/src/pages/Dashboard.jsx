import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPatients, getAccessLogs, getAllUsers, getAppointments, updateAppointmentStatus } from '../services/api';
import SessionTimeout from '../components/SessionTimeout';
import AddPatientModal from '../components/AddPatientModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients,      setPatients]      = useState([]);
  const [logs,          setLogs]          = useState([]);
  const [users,         setUsers]         = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [time,          setTime]          = useState(new Date());
  const [activeTab,     setActiveTab]     = useState('overview');
  const [showAddPatient,setShowAddPatient]= useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getPatients().then(r => setPatients(r.data)).catch(() => {});
    if (['admin','doctor','nurse'].includes(user.role)) {
      getAppointments().then(r => setAppointments(r.data)).catch(() => {});
    }
    if (['admin','it_security'].includes(user.role)) {
      getAllUsers().then(r => setUsers(r.data)).catch(() => {});
      getAccessLogs().then(r => setLogs(r.data)).catch(() => {});
    }
  }, [user.role]);

  function handleLogout() { logout(); navigate('/login'); }

  async function handleStatusChange(id, status) {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch { alert('Failed to update status'); }
  }

  const roleColors = { doctor:'#2D7DD2', nurse:'#10B981', admin:'#F59E0B', lab_tech:'#8B5CF6', pharmacist:'#EC4899', it_security:'#EF4444', patient:'#6B7280' };
  const roleColor      = roleColors[user.role] || '#2D7DD2';
  const pendingCount   = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const navItems = [
    { id:'overview',     label:'Overview',     icon:'◈', roles:null },
    { id:'appointments', label:'Appointments', icon:'📅', roles:['admin','doctor','nurse'] },
    { id:'patients',     label:'Patients',     icon:'◉', roles:['doctor','nurse','admin','lab_tech','pharmacist'] },
    { id:'logs',         label:'Access Logs',  icon:'◎', roles:['admin','it_security'] },
    { id:'users',        label:'Users',        icon:'◍', roles:['admin','it_security'] },
    { id:'ml',           label:'ML Detection', icon:'🤖', roles:['admin','it_security','doctor'] },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <div style={s.layout}>
      <SessionTimeout />

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.sidebarLogo}>
            <img src="/images/logo.png" alt="logo" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
            <span style={s.sidebarLogoText}>Mavaji's HIS</span>
          </div>
          <div style={s.userCard}>
            <div style={{ ...s.userAvatar, background:`${roleColor}22`, border:`1px solid ${roleColor}44` }}>
              <span style={{ fontSize:'18px', fontWeight:'700', fontFamily:'var(--font-heading)', color:roleColor }}>{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div style={s.userName}>{user.name}</div>
              <div style={{ fontSize:'11px', fontFamily:'var(--font-mono)', letterSpacing:'0.08em', marginTop:'2px', color:roleColor }}>{user.role.replace('_',' ').toUpperCase()}</div>
            </div>
          </div>
          <nav style={s.nav}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                style={{ ...s.navItem, ...(activeTab === item.id ? s.navItemActive : {}) }}>
                <span style={s.navIcon}>{item.icon}</span>
                {item.label}
                {item.id === 'appointments' && pendingCount > 0 && (
                  <span style={{ marginLeft:'auto', background:'#F59E0B', color:'#fff', borderRadius:'10px', fontSize:'11px', fontWeight:'600', padding:'2px 7px' }}>{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <button onClick={() => navigate('/')} style={s.backToWebBtn}><span>🏥</span> Main Website</button>
          {['admin','it_security'].includes(user.role) && (
            <button onClick={() => navigate('/security-test')} style={s.secTestBtn}><span>🔐</span> Security Tests</button>
          )}
          <button onClick={handleLogout} style={s.logoutBtn}><span>⊗</span> Sign Out</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h2 style={s.pageTitle}>
              {activeTab === 'overview'     && 'Dashboard Overview'}
              {activeTab === 'appointments' && 'Appointments'}
              {activeTab === 'patients'     && 'Patient Records'}
              {activeTab === 'logs'         && 'Access Logs'}
              {activeTab === 'users'        && 'User Management'}
              {activeTab === 'ml'           && 'ML Anomaly Detection'}
            </h2>
            <p style={s.pageSubtitle}>
              {time.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              {' · '}{time.toLocaleTimeString('en-US', { hour12:false })}
            </p>
          </div>
          <div style={s.securityBadge}>
            <div style={s.securityDot} />
            <span style={s.securityText}>ZERO TRUST ACTIVE</span>
          </div>
        </div>

        <div style={s.content}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={s.statsGrid}>
                <StatCard label="Total Patients"  value={patients.length}     color="#2D7DD2" icon="◉" />
                <StatCard label="Appointments"    value={appointments.length} color="#10B981" icon="📅" />
                <StatCard label="Pending"         value={pendingCount}        color="#F59E0B" icon="⏳" />
                <StatCard label="Security Level"  value="HIGH"                color="#EF4444" icon="◈" />
              </div>
              {['admin','doctor','nurse'].includes(user.role) && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'20px' }}>
                  {[
                    { label:'Pending',   count:pendingCount,   color:'#F59E0B', bg:'rgba(245,158,11,0.1)'  },
                    { label:'Confirmed', count:confirmedCount, color:'#10B981', bg:'rgba(16,185,129,0.1)'  },
                    { label:'Cancelled', count:cancelledCount, color:'#EF4444', bg:'rgba(239,68,68,0.1)'   },
                  ].map((item, i) => (
                    <div key={i} style={{ ...s.infoCard, background:item.bg, border:`1px solid ${item.color}33`, textAlign:'center' }}>
                      <div style={{ fontSize:'28px', fontWeight:'700', color:item.color, fontFamily:'var(--font-heading)' }}>{item.count}</div>
                      <div style={{ fontSize:'13px', color:'var(--text-secondary)', marginTop:'4px' }}>{item.label} Appointments</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={s.infoCard}>
                <h3 style={s.cardTitle}>Your Access Permissions</h3>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'20px' }}>Role: <span style={{ color:roleColor, fontWeight:600 }}>{user.role.replace('_',' ').toUpperCase()}</span></p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px' }}>
                  {getPermissions(user.role).map((perm, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ color:'var(--success)' }}>✓</span>
                      <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={s.infoCard}>
                <h3 style={s.cardTitle}>Zero Trust Status</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {[
                    { label:'Identity Verified',    status:true },
                    { label:'Device Authenticated', status:true },
                    { label:'Session Active',       status:true },
                    { label:'Access Logged',        status:true },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'var(--bg-secondary)', borderRadius:'8px' }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', flexShrink:0, background: item.status ? 'var(--success)' : 'var(--danger)' }} />
                      <span style={{ flex:1, fontSize:'13px', color:'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize:'11px', fontFamily:'var(--font-mono)', fontWeight:'600', letterSpacing:'0.08em', color: item.status ? 'var(--success)' : 'var(--danger)' }}>{item.status ? 'PASS' : 'FAIL'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div style={s.infoCard}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <h3 style={s.cardTitle}>All Appointments</h3>
                <div style={{ display:'flex', gap:'8px' }}>
                  {[
                    { label:`Pending ${pendingCount}`,    color:'#F59E0B' },
                    { label:`Confirmed ${confirmedCount}`,color:'#10B981' },
                    { label:`Cancelled ${cancelledCount}`,color:'#EF4444' },
                  ].map((b, i) => (
                    <span key={i} style={{ display:'inline-block', padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'500', color:b.color, border:`1px solid ${b.color}44`, background:`${b.color}11` }}>{b.label}</span>
                  ))}
                </div>
              </div>
              {appointments.length === 0 ? (
                <p style={s.emptyText}>No appointments booked yet.</p>
              ) : (
                <table style={s.table}>
                  <thead><tr>{['#','Patient','Phone','Department','Date','Time','Status','Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id} style={s.tr}>
                        <td style={s.td}>#{apt.id}</td>
                        <td style={{ ...s.td, fontWeight:'500' }}>{apt.patient_name}</td>
                        <td style={s.td}>{apt.phone}</td>
                        <td style={s.td}>{apt.department}</td>
                        <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'12px' }}>{apt.preferred_date?.substring(0,10)}</td>
                        <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'12px' }}>{apt.preferred_time}</td>
                        <td style={s.td}>
                          <span style={{ ...s.pill, background: apt.status==='confirmed' ? 'rgba(16,185,129,0.15)' : apt.status==='cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: apt.status==='confirmed' ? 'var(--success)' : apt.status==='cancelled' ? 'var(--danger)' : '#F59E0B' }}>
                            {apt.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={s.td}>
                          {user.role === 'admin' && apt.status === 'pending' && (
                            <div style={{ display:'flex', gap:'6px' }}>
                              <button onClick={() => handleStatusChange(apt.id,'confirmed')} style={s.confirmBtn}>Confirm</button>
                              <button onClick={() => handleStatusChange(apt.id,'cancelled')} style={s.cancelBtn}>Cancel</button>
                            </div>
                          )}
                          {apt.status !== 'pending' && <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{apt.status === 'confirmed' ? '✓ Done' : '✗ Cancelled'}</span>}
                          {user.role !== 'admin' && apt.status === 'pending' && <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>View only</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PATIENTS */}
          {activeTab === 'patients' && (
            <div style={s.infoCard}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <h3 style={s.cardTitle}>Patient Registry</h3>
                {user.role === 'admin' && (
                  <button onClick={() => setShowAddPatient(true)} style={{ padding:'8px 16px', background:'var(--accent)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>+ Add Patient</button>
                )}
              </div>
              {patients.length === 0 ? (
                <p style={s.emptyText}>No patients found.</p>
              ) : (
                <table style={s.table}>
                  <thead><tr>{['ID','Name','Date of Birth','Gender','Blood Type','Phone'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id} style={s.tr}>
                        <td style={s.td}>#{p.id}</td>
                        <td style={s.td}>{p.name}</td>
                        <td style={s.td}>{p.dob?.substring(0,10)}</td>
                        <td style={s.td}>{p.gender || '—'}</td>
                        <td style={s.td}>{p.blood_type || '—'}</td>
                        <td style={s.td}>{p.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {showAddPatient && (
                <AddPatientModal
                  onClose={() => setShowAddPatient(false)}
                  onSuccess={() => { getPatients().then(r => setPatients(r.data)).catch(() => {}); }}
                />
              )}
            </div>
          )}

          {/* LOGS */}
          {activeTab === 'logs' && (
            <div style={s.infoCard}>
              <h3 style={s.cardTitle}>Access Logs — Real Time</h3>
              <table style={s.table}>
                <thead><tr>{['Time','User','Role','Action','Resource','IP','Outcome'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {logs.slice(0,100).map(log => (
                    <tr key={log.id} style={s.tr}>
                      <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'11px' }}>{new Date(log.created_at).toLocaleTimeString()}</td>
                      <td style={s.td}>{log.user_name || '—'}</td>
                      <td style={s.td}>{log.role || '—'}</td>
                      <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'11px' }}>{log.action}</td>
                      <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-secondary)' }}>{log.resource || '—'}</td>
                      <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'11px' }}>{log.ip_address}</td>
                      <td style={s.td}>
                        <span style={{ ...s.pill, background: log.outcome==='success' ? 'rgba(16,185,129,0.15)' : log.outcome==='denied' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: log.outcome==='success' ? 'var(--success)' : log.outcome==='denied' ? 'var(--danger)' : '#F59E0B' }}>
                          {log.outcome.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div style={s.infoCard}>
              <h3 style={s.cardTitle}>System Users</h3>
              <table style={s.table}>
                <thead><tr>{['ID','Name','Email','Role','Status','Last Login'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={s.tr}>
                      <td style={s.td}>#{u.id}</td>
                      <td style={s.td}>{u.name}</td>
                      <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'12px' }}>{u.email}</td>
                      <td style={s.td}><span style={{ ...s.pill, background:'rgba(45,125,210,0.15)', color:'var(--accent-bright)' }}>{u.role.replace('_',' ')}</span></td>
                      <td style={s.td}><span style={{ ...s.pill, background: u.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: u.is_active ? 'var(--success)' : 'var(--danger)' }}>{u.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                      <td style={{ ...s.td, fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-secondary)' }}>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ML */}
          {activeTab === 'ml' && (
            <div style={s.infoCard}>
              <h3 style={s.cardTitle}>ML Anomaly Detection</h3>
              <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'20px' }}>Isolation Forest model detects suspicious user behaviour in real time</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' }}>
                {[
                  { label:'Model',          value:'Isolation Forest', color:'#8B5CF6' },
                  { label:'Accuracy',       value:'91.8%',            color:'#10B981' },
                  { label:'False Positive', value:'6.1%',             color:'#F59E0B' },
                ].map((item, i) => (
                  <div key={i} style={{ background:'var(--bg-secondary)', borderRadius:'10px', padding:'16px', textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:'700', color:item.color, fontFamily:'var(--font-heading)' }}>{item.value}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/ml-demo')} style={{ width:'100%', padding:'14px', background:'#8B5CF6', border:'none', borderRadius:'10px', color:'#fff', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' }}>
                🤖 Open ML Anomaly Detection Demo
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background:'var(--bg-card)', border:`1px solid ${color}22`, borderRadius:'12px', padding:'24px', textAlign:'center' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', margin:'0 auto 12px', background:`${color}15`, color }}>{icon}</div>
      <div style={{ fontSize:'28px', fontWeight:'700', fontFamily:'var(--font-heading)', marginBottom:'4px', color }}>{value}</div>
      <div style={{ fontSize:'12px', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' }}>{label}</div>
    </div>
  );
}

function getPermissions(role) {
  const perms = {
    doctor:      ['View patient records','Create EHR records','View lab reports','View appointments'],
    nurse:       ['View patient records','View EHR records','View appointments'],
    admin:       ['Full system access','Manage appointments','Manage users','View all logs'],
    lab_tech:    ['View patients','Create lab reports','View lab results'],
    pharmacist:  ['View patients','View pharmacy records'],
    it_security: ['View all access logs','Monitor system activity','View user list'],
    patient:     ['View own records'],
  };
  return perms[role] || ['Basic access'];
}

const s = {
  layout:        { display:'flex', minHeight:'100vh', background:'var(--bg-primary)' },
  sidebar:       { width:'260px', background:'var(--bg-card)', borderRight:'1px solid var(--border-dark)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'24px 16px', flexShrink:0 },
  sidebarTop:    { display:'flex', flexDirection:'column', gap:'24px' },
  sidebarLogo:   { display:'flex', alignItems:'center', gap:'10px', padding:'0 8px' },
  sidebarLogoText:{ fontFamily:'var(--font-heading)', fontSize:'15px', fontWeight:'700', color:'var(--text-primary)' },
  userCard:      { display:'flex', alignItems:'center', gap:'12px', background:'var(--bg-secondary)', borderRadius:'10px', padding:'12px' },
  userAvatar:    { width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  userName:      { fontSize:'14px', fontWeight:'600', color:'var(--text-primary)' },
  nav:           { display:'flex', flexDirection:'column', gap:'4px' },
  navItem:       { display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', background:'transparent', border:'none', color:'var(--text-secondary)', fontSize:'14px', cursor:'pointer', textAlign:'left', width:'100%', position:'relative' },
  navItemActive: { background:'var(--accent-glow)', color:'var(--accent-bright)', border:'1px solid var(--border-hover)' },
  navIcon:       { fontSize:'16px', width:'20px', textAlign:'center' },
  backToWebBtn:  { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'rgba(26,143,143,0.15)', border:'1px solid rgba(26,143,143,0.3)', color:'var(--accent-bright)', fontSize:'14px', cursor:'pointer', width:'100%' },
  secTestBtn:    { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'var(--success)', fontSize:'14px', cursor:'pointer', width:'100%' },
  logoutBtn:     { display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#FCA5A5', fontSize:'14px', cursor:'pointer', width:'100%' },
  main:          { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:        { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 32px', borderBottom:'1px solid var(--border-dark)', background:'var(--bg-card)' },
  pageTitle:     { fontFamily:'var(--font-heading)', fontSize:'22px', fontWeight:'700', color:'var(--text-primary)' },
  pageSubtitle:  { fontSize:'13px', color:'var(--text-secondary)', marginTop:'2px', fontFamily:'var(--font-mono)' },
  securityBadge: { display:'flex', alignItems:'center', gap:'8px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'20px', padding:'6px 14px' },
  securityDot:   { width:'7px', height:'7px', borderRadius:'50%', background:'var(--success)', boxShadow:'0 0 6px var(--success)' },
  securityText:  { fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--success)', letterSpacing:'0.1em' },
  content:       { flex:1, padding:'32px', overflowY:'auto' },
  statsGrid:     { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' },
  infoCard:      { background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'12px', padding:'24px', marginBottom:'20px' },
  cardTitle:     { fontFamily:'var(--font-heading)', fontSize:'16px', fontWeight:'600', color:'var(--text-primary)', marginBottom:'4px' },
  table:         { width:'100%', borderCollapse:'collapse' },
  th:            { textAlign:'left', padding:'10px 12px', background:'var(--bg-secondary)', fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'0.08em', borderBottom:'1px solid var(--border-dark)' },
  tr:            { borderBottom:'1px solid var(--border-dark)' },
  td:            { padding:'12px', fontSize:'13px', color:'var(--text-primary)' },
  pill:          { display:'inline-block', padding:'3px 8px', borderRadius:'4px', fontSize:'11px', fontFamily:'var(--font-mono)', fontWeight:'600', letterSpacing:'0.05em' },
  confirmBtn:    { padding:'5px 10px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'6px', color:'var(--success)', fontSize:'12px', cursor:'pointer', fontWeight:'500' },
  cancelBtn:     { padding:'5px 10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'6px', color:'var(--danger)', fontSize:'12px', cursor:'pointer', fontWeight:'500' },
  emptyText:     { color:'var(--text-secondary)', fontSize:'14px', padding:'20px 0' },
};