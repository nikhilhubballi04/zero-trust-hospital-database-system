import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPatients, getAccessLogs, getAllUsers, getAppointments, updateAppointmentStatus } from '../services/api';
import SessionTimeout from '../components/SessionTimeout';
import AddPatientModal from '../components/AddPatientModal';

// High-fidelity SVG icons
const Icons = {
  Overview: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Patients: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Logs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
  ML: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" /><circle cx="12" cy="12" r="4" />
    </svg>
  ),
  Cross: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16m-8-8h16" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Lock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [patients, setPatients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Search & Filter states
  const [aptStatusFilter, setAptStatusFilter] = useState('All');
  const [patientSearch, setPatientSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getPatients().then(r => setPatients(r.data || [])).catch(() => {});
    if (['admin', 'doctor', 'nurse'].includes(user.role)) {
      getAppointments().then(r => setAppointments(r.data || [])).catch(() => {});
    }
    if (['admin', 'it_security'].includes(user.role)) {
      getAllUsers().then(r => setUsers(r.data || [])).catch(() => {});
      getAccessLogs().then(r => setLogs(r.data || [])).catch(() => {});
    }
  }, [user.role]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleStatusChange(id, status) {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    } catch {
      alert('Failed to update appointment status');
    }
  }

  const roleColors = {
    doctor: '#3B82F6',
    nurse: '#10B981',
    admin: '#F59E0B',
    lab_tech: '#8B5CF6',
    pharmacist: '#EC4899',
    it_security: '#EF4444',
    patient: '#6B7280'
  };

  const roleClearance = {
    admin: 'Level 4 · System Authority',
    it_security: 'Level 4 · Security & Audit Officer',
    doctor: 'Level 3 · Clinical Specialist',
    nurse: 'Level 2 · Inpatient Care Staff',
    lab_tech: 'Level 2 · Laboratory Diagnostics',
    pharmacist: 'Level 2 · Pharmacy Services',
    patient: 'Level 1 · Personal Patient Records'
  };

  const roleColor = roleColors[user.role] || '#3B82F6';
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Icons.Overview />, roles: null },
    { id: 'appointments', label: 'Appointments', icon: <Icons.Calendar />, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'patients', label: 'Patient Registry', icon: <Icons.Patients />, roles: ['doctor', 'nurse', 'admin', 'lab_tech', 'pharmacist'] },
    { id: 'logs', label: 'Access Logs', icon: <Icons.Logs />, roles: ['admin', 'it_security'] },
    { id: 'users', label: 'User Directory', icon: <Icons.Users />, roles: ['admin', 'it_security'] },
    { id: 'ml', label: 'ML Anomaly Detection', icon: <Icons.ML />, roles: ['admin', 'it_security', 'doctor'] }
  ].filter(item => !item.roles || item.roles.includes(user.role));

  // Filtered lists
  const filteredAppointments = appointments.filter(a => {
    if (aptStatusFilter === 'All') return true;
    return a.status === aptStatusFilter.toLowerCase();
  });

  const filteredPatients = patients.filter(p => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.blood_type && p.blood_type.toLowerCase().includes(q))
    );
  });

  const filteredLogs = logs.filter(l => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      (l.user_name && l.user_name.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.ip_address && l.ip_address.includes(q)) ||
      (l.resource && l.resource.toLowerCase().includes(q))
    );
  });

  return (
    <div style={s.layout}>
      <SessionTimeout />

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          {/* Logo */}
          <div style={s.sidebarLogo}>
            <div style={s.logoIcon}>
              <Icons.Cross />
            </div>
            <div>
              <div style={s.sidebarLogoTitle}>Mavaji's HIS</div>
              <div style={s.sidebarLogoSub}>ZERO TRUST CLINICAL WORKSTATION</div>
            </div>
          </div>

          {/* User Profile Card */}
          <div style={s.userCard}>
            <div style={{ ...s.userAvatar, background: `${roleColor}25`, borderColor: `${roleColor}50` }}>
              <span style={{ color: roleColor, fontWeight: '700', fontSize: '16px' }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={s.userName} title={user.name}>{user.name}</div>
              <div style={{ ...s.userRoleBadge, color: roleColor }}>
                {user.role.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={s.nav}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...s.navItem,
                  ...(activeTab === item.id ? s.navItemActive : {})
                }}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'appointments' && pendingCount > 0 && (
                  <span style={s.navBadgePending}>{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div style={s.sidebarBottom}>
          <div style={s.clearanceBox}>
            <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>CLEARANCE</div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
              {roleClearance[user.role] || 'Standard Access'}
            </div>
          </div>

          <button onClick={() => navigate('/')} style={s.backToWebBtn}>
            <span>🏥</span>
            <span>Hospital Website</span>
          </button>
          
          <button onClick={handleLogout} style={s.logoutBtn}>
            <span>⊗</span>
            <span>Sign Out Workstation</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={s.main}>
        {/* Top Header Bar */}
        <div style={s.topbar}>
          <div>
            <h2 style={s.pageTitle}>
              {activeTab === 'overview' && 'Clinical Workstation Overview'}
              {activeTab === 'appointments' && 'Outpatient & Specialist Appointments'}
              {activeTab === 'patients' && 'Zero Trust Patient Electronic Health Records'}
              {activeTab === 'logs' && 'Immutable Access & Security Audit Logs'}
              {activeTab === 'users' && 'Staff & Clinical Personnel Directory'}
              {activeTab === 'ml' && 'Machine Learning Behavioral Anomaly Detection'}
            </h2>
            <p style={s.pageSubtitle}>
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              {time.toLocaleTimeString('en-US', { hour12: false })} IST
            </p>
          </div>

          <div style={s.topbarRight}>
            <div style={s.pepTag}>
              <Icons.Lock />
              <span>PEP GATEWAY · PORT 5000</span>
            </div>
            <div style={s.securityBadge}>
              <div style={s.securityDot} />
              <span style={s.securityText}>NIST ZERO TRUST ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Tab Content Container */}
        <div style={s.content}>

          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Metric Cards */}
              <div style={s.statsGrid}>
                <StatCard 
                  label="REGISTERED PATIENTS" 
                  value={patients.length} 
                  color="#3B82F6" 
                  icon={<Icons.Patients />} 
                />
                <StatCard 
                  label="TOTAL APPOINTMENTS" 
                  value={appointments.length} 
                  color="#10B981" 
                  icon={<Icons.Calendar />} 
                />
                <StatCard 
                  label="PENDING CONFIRMATIONS" 
                  value={pendingCount} 
                  color="#F59E0B" 
                  icon="⏳" 
                />
                <StatCard 
                  label="SECURITY POSTURE" 
                  value="ENFORCED" 
                  color="#10B981" 
                  icon={<Icons.Logs />} 
                />
              </div>

              {/* Appointment Triage Cards for Staff */}
              {['admin', 'doctor', 'nurse'].includes(user.role) && (
                <div style={s.aptTriageGrid}>
                  {[
                    { label: 'Pending Review', count: pendingCount, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
                    { label: 'Confirmed & Scheduled', count: confirmedCount, color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
                    { label: 'Cancelled', count: cancelledCount, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' }
                  ].map((item, i) => (
                    <div key={i} style={{ ...s.infoCard, background: item.bg, borderColor: `${item.color}30`, textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: item.color, fontFamily: 'var(--font-heading)' }}>
                        {item.count}
                      </div>
                      <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Two-Column Clinical Permissions & Security Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                
                {/* Role Permissions */}
                <div style={s.infoCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={s.cardTitle}>Your Departmental Access Privileges</h3>
                    <span style={{ fontSize: '11px', color: roleColor, fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px', lineHeight: '1.6' }}>
                    Access permissions are micro-segmented and strictly bounded to your clinical responsibilities under least-privilege policy.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {getPermissions(user.role).map((perm, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#131F37', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                        <span style={{ color: '#10B981' }}><Icons.Check /></span>
                        <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '500' }}>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zero Trust Continuous Telemetry */}
                <div style={s.infoCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={s.cardTitle}>Real-Time Security Telemetry</h3>
                    <span style={{ fontSize: '11px', color: '#10B981', fontFamily: 'var(--font-mono)' }}>NIST 800-207</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Cryptographic JWT Token', status: true, detail: '15-Min Life' },
                      { label: 'Device & IP Fingerprint', status: true, detail: 'Local Workstation' },
                      { label: 'Role-Based Access Enforcement', status: true, detail: 'Micro-Segmented' },
                      { label: 'Audit Logging Stream', status: true, detail: 'access_logs Active' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#131F37', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                        <span style={{ flex: 1, fontSize: '13px', color: '#CBD5E1' }}>{item.label}</span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= APPOINTMENTS TAB ================= */}
          {activeTab === 'appointments' && (
            <div style={s.infoCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={s.cardTitle}>Patient Appointment Triage</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                    Manage consultations, verify clinical schedules, and confirm pending patient requests.
                  </p>
                </div>
                {/* Status Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['All', 'Pending', 'Confirmed', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setAptStatusFilter(st)}
                      style={{
                        ...s.filterBtn,
                        ...(aptStatusFilter === st ? s.filterBtnActive : {})
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>No appointments found for this status.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {['#', 'Patient Name', 'Contact Phone', 'Department', 'Scheduled Date', 'Time Slot', 'Status', 'Clinical Actions'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map(apt => (
                        <tr key={apt.id} style={s.tr}>
                          <td style={s.tdMono}>#{apt.id}</td>
                          <td style={{ ...s.td, fontWeight: '600' }}>{apt.patient_name}</td>
                          <td style={s.td}>{apt.phone}</td>
                          <td style={s.td}>
                            <span style={s.deptPill}>{apt.department}</span>
                          </td>
                          <td style={s.tdMono}>{apt.preferred_date?.substring(0, 10)}</td>
                          <td style={s.tdMono}>{apt.preferred_time}</td>
                          <td style={s.td}>
                            <span
                              style={{
                                ...s.statusPill,
                                background:
                                  apt.status === 'confirmed'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : apt.status === 'cancelled'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)',
                                color:
                                  apt.status === 'confirmed'
                                    ? '#34D399'
                                    : apt.status === 'cancelled'
                                    ? '#F87171'
                                    : '#FBBF24'
                              }}
                            >
                              {apt.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={s.td}>
                            {['admin', 'doctor', 'nurse'].includes(user.role) && apt.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleStatusChange(apt.id, 'confirmed')} style={s.confirmBtn}>
                                  Confirm
                                </button>
                                <button onClick={() => handleStatusChange(apt.id, 'cancelled')} style={s.cancelBtn}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                {apt.status === 'confirmed' ? '✓ Scheduled' : apt.status === 'cancelled' ? '✗ Cancelled' : 'View Only'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= PATIENT REGISTRY TAB ================= */}
          {activeTab === 'patients' && (
            <div style={s.infoCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={s.cardTitle}>Inpatient & Outpatient Registry</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                    Encrypted patient demographic records and attending physician links.
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Live Search */}
                  <div style={s.searchWrap}>
                    <Icons.Search />
                    <input 
                      type="text"
                      value={patientSearch}
                      onChange={e => setPatientSearch(e.target.value)}
                      placeholder="Search patient, phone, blood..."
                      style={s.searchInput}
                    />
                  </div>

                  {['admin', 'doctor', 'nurse'].includes(user.role) && (
                    <button onClick={() => setShowAddPatient(true)} style={s.primaryActionBtn}>
                      + Register Patient
                    </button>
                  )}
                </div>
              </div>

              {filteredPatients.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏥</div>
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>No patients found matching your search.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {['Patient ID', 'Full Name', 'Date of Birth', 'Gender', 'Blood Group', 'Contact Phone', 'Registered On'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map(p => (
                        <tr key={p.id} style={s.tr}>
                          <td style={s.tdMono}>#PAT-{String(p.id).padStart(4, '0')}</td>
                          <td style={{ ...s.td, fontWeight: '600', color: '#FFFFFF' }}>{p.name}</td>
                          <td style={s.tdMono}>{p.dob ? p.dob.substring(0, 10) : '—'}</td>
                          <td style={s.td}>{p.gender ? p.gender.toUpperCase() : '—'}</td>
                          <td style={s.td}>
                            <span style={s.bloodBadge}>{p.blood_type || 'N/A'}</span>
                          </td>
                          <td style={s.td}>{p.phone || '—'}</td>
                          <td style={s.tdMono}>{p.created_at ? p.created_at.substring(0, 10) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showAddPatient && (
                <AddPatientModal
                  onClose={() => setShowAddPatient(false)}
                  onSuccess={() => {
                    getPatients().then(r => setPatients(r.data || [])).catch(() => {});
                  }}
                />
              )}
            </div>
          )}

          {/* ================= ACCESS LOGS TAB (ADMIN / IT SEC) ================= */}
          {activeTab === 'logs' && (
            <div style={s.infoCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={s.cardTitle}>Immutable Zero Trust Access Audit Trail</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                    Every authentication, EHR inspection, and API request is cryptographically recorded.
                  </p>
                </div>

                <div style={s.searchWrap}>
                  <Icons.Search />
                  <input 
                    type="text"
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    placeholder="Search user, action, IP..."
                    style={s.searchInput}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Timestamp', 'User Identity', 'Role', 'Action', 'Resource URI', 'Client IP', 'Zero Trust Outcome'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 100).map(log => (
                      <tr key={log.id} style={s.tr}>
                        <td style={s.tdMono}>
                          {new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false })}
                        </td>
                        <td style={{ ...s.td, fontWeight: '500' }}>{log.user_name || 'System / Unauth'}</td>
                        <td style={s.td}>
                          <span style={s.rolePill}>{log.role || 'GUEST'}</span>
                        </td>
                        <td style={s.tdMono}>{log.action}</td>
                        <td style={{ ...s.tdMono, color: '#93C5FD' }}>{log.resource || '—'}</td>
                        <td style={s.tdMono}>{log.ip_address}</td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.statusPill,
                              background:
                                log.outcome === 'success'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : log.outcome === 'denied'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                              color:
                                log.outcome === 'success'
                                  ? '#34D399'
                                  : log.outcome === 'denied'
                                  ? '#F87171'
                                  : '#FBBF24'
                            }}
                          >
                            {log.outcome.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= USERS DIRECTORY TAB (ADMIN / IT SEC) ================= */}
          {activeTab === 'users' && (
            <div style={s.infoCard}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={s.cardTitle}>Clinical & Technical Staff Directory</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                  Authenticated users with active role-based access tokens in MySQL.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['ID', 'Staff Name', 'Official Email', 'Assigned Role', 'Account Status', 'Last Activity'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={s.tr}>
                        <td style={s.tdMono}>#{u.id}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{u.name}</td>
                        <td style={s.tdMono}>{u.email}</td>
                        <td style={s.td}>
                          <span style={{ ...s.rolePill, color: roleColors[u.role] || '#3B82F6' }}>
                            {u.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.statusPill,
                              background: u.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: u.is_active ? '#34D399' : '#F87171'
                            }}
                          >
                            {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td style={s.tdMono}>
                          {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never logged in'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ML ANOMALY DETECTION TAB ================= */}
          {activeTab === 'ml' && (
            <div style={s.infoCard}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={s.cardTitle}>Intelligent Anomaly Detection Service</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                  Powered by Python Isolation Forest trained on access logs to identify insider threats and compromised accounts.
                </p>
              </div>

              <div style={s.mlMetricGrid}>
                {[
                  { label: 'ALGORITHM', value: 'Isolation Forest', sub: 'Scikit-learn Unsupervised', color: '#A855F7' },
                  { label: 'ACCURACY', value: '91.8%', sub: 'Validated Test Split', color: '#10B981' },
                  { label: 'PRECISION', value: '89.5%', sub: 'Low False Positives (6.1%)', color: '#3B82F6' },
                  { label: 'CONTAMINATION', value: '0.1', sub: 'Calculated Outlier Bound', color: '#F59E0B' }
                ].map((item, i) => (
                  <div key={i} style={s.mlCard}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>{item.label}</div>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: item.color, fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              <div style={s.mlFeaturesBox}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
                  Monitored Behavioral Dimensions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { dim: 'Login Hour (0-23)', desc: 'Flags off-hours clinical access (e.g. 3 AM)' },
                    { dim: 'Request Count', desc: 'Flags bulk record exfiltration attempts' },
                    { dim: 'IP Whitelist Status', desc: 'Flags unknown or foreign subnet origins' },
                    { dim: 'Cross-Role Access', desc: 'Detects unauthorized module probing' }
                  ].map((d, i) => (
                    <div key={i} style={s.featureCard}>
                      <div style={{ fontWeight: '600', color: '#93C5FD', fontSize: '13px' }}>{d.dim}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{d.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#131F37', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '14px' }}>ML Microservice Endpoint</div>
                  <div style={{ color: '#64748B', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>http://localhost:5001/predict (ml/app.py)</div>
                </div>
                <span style={s.badgeSuccess}>Model Ready</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...s.infoCard, padding: '24px', borderColor: `${color}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            {label}
          </div>
          <div style={{ fontSize: '30px', fontWeight: '700', color, fontFamily: 'var(--font-heading)', marginTop: '6px' }}>
            {value}
          </div>
        </div>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getPermissions(role) {
  const perms = {
    doctor: [
      'Access Electronic Health Records (EHR)',
      'Create Inpatient & Outpatient Clinical Diagnoses',
      'Order Laboratory Investigations',
      'Manage Outpatient Consultation Slots'
    ],
    nurse: [
      'Inspect Patient Demographics & Records',
      'View Active Electronic Health Records',
      'Monitor Inpatient Bed Assignments',
      'Triage Appointment Check-Ins'
    ],
    admin: [
      'Full Administrative Healthcare Authority',
      'Register & Provision Clinical Personnel',
      'Confirm & Schedule Patient Appointments',
      'Review Zero Trust System Access Logs'
    ],
    lab_tech: [
      'View Lab Test Requests',
      'Input Diagnostic & Pathology Results',
      'Flag Abnormal Biomarker Values',
      'Upload Automated Specimen Reports'
    ],
    pharmacist: [
      'Inspect Active Doctor Prescriptions',
      'Log Medicine Dispensing Events',
      'Inventory Stock Reconciliations',
      'Review Dosage Verification Protocols'
    ],
    it_security: [
      'Monitor Real-Time Zero Trust Access Logs',
      'Audit Behavioral Anomaly Triggers',
      'Inspect Failed Authentication Streams',
      'Enforce Token Expiry & Revocation'
    ],
    patient: ['Access Personal Diagnostic Reports']
  };
  return perms[role] || ['Basic Consultation Access'];
}

const s = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#070B19',
    color: '#F8FAFC'
  },
  sidebar: {
    width: '270px',
    background: '#0E172A',
    borderRight: '1px solid rgba(59, 130, 246, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    flexShrink: 0
  },
  sidebarTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1E40AF, #0D9488)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sidebarLogoTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  sidebarLogoSub: {
    fontSize: '8px',
    color: '#64748B',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-mono)'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#131F37',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '12px',
    padding: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userRoleBadge: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    letterSpacing: '0.06em',
    marginTop: '2px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s ease'
  },
  navItemActive: {
    background: 'rgba(37, 99, 235, 0.18)',
    color: '#60A5FA',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    fontWeight: '600'
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85
  },
  navBadgePending: {
    background: '#F59E0B',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px'
  },
  sidebarBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(59, 130, 246, 0.12)'
  },
  clearanceBox: {
    background: '#131F37',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  backToWebBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    color: '#93C5FD',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#FCA5A5',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 36px',
    borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
    background: '#0E172A'
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  pepTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#131F37',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#60A5FA'
  },
  pageTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  pageSubtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '2px',
    fontFamily: 'var(--font-mono)'
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '20px',
    padding: '6px 14px'
  },
  securityDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 8px #10B981'
  },
  securityText: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#34D399',
    fontWeight: '700',
    letterSpacing: '0.06em'
  },
  content: {
    flex: 1,
    padding: '32px 36px',
    overflowY: 'auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  aptTriageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  infoCard: {
    background: '#0E172A',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
  },
  cardTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '17px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#131F37',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#94A3B8',
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.15s'
  },
  td: {
    padding: '14px',
    color: '#E2E8F0'
  },
  tdMono: {
    padding: '14px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: '#94A3B8'
  },
  statusPill: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700'
  },
  rolePill: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    background: '#131F37',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '600'
  },
  deptPill: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    background: '#131F37',
    fontSize: '12px',
    color: '#93C5FD'
  },
  bloodBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#F87171',
    fontWeight: '700',
    fontSize: '12px'
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    background: '#131F37',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: '#94A3B8',
    fontSize: '12px',
    cursor: 'pointer'
  },
  filterBtnActive: {
    background: '#2563EB',
    color: '#FFFFFF',
    borderColor: '#2563EB'
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#131F37',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '8px',
    padding: '0 12px',
    color: '#94A3B8'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#F8FAFC',
    fontSize: '13px',
    padding: '8px 0',
    outline: 'none',
    width: '200px'
  },
  primaryActionBtn: {
    padding: '9px 18px',
    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
  },
  confirmBtn: {
    padding: '5px 12px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '6px',
    color: '#34D399',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '5px 12px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#F87171',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0'
  },
  mlMetricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  mlCard: {
    background: '#131F37',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '12px',
    padding: '18px',
    textAlign: 'center'
  },
  mlFeaturesBox: {
    background: 'rgba(59, 130, 246, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  featureCard: {
    background: '#0E172A',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px'
  },
  badgeSuccess: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#34D399',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '4px 10px',
    borderRadius: '12px'
  }
};