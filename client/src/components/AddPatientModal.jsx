import { useState } from 'react';
import { addPatient } from '../services/api';

export default function AddPatientModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name:'', dob:'', gender:'', blood_type:'', phone:'', address:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function handle(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await addPatient(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)', padding:'12px' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-dark)', borderRadius:'16px', padding:'24px 20px', width:'560px', maxWidth:'94vw', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'18px', fontWeight:'600', color:'var(--text-primary)' }}>Add New Patient</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-secondary)', fontSize:'18px', cursor:'pointer' }}>✕</button>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', color:'#FCA5A5', fontSize:'13px', marginBottom:'16px' }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="responsive-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'24px' }}>
            {[
              { name:'name',       label:'Full Name *',    type:'text',   placeholder:'Patient full name',  required:true  },
              { name:'dob',        label:'Date of Birth *',type:'date',   placeholder:'',                   required:true  },
              { name:'phone',      label:'Phone Number',   type:'text',   placeholder:'+91 98765 43210',    required:false },
              { name:'address',    label:'Address',        type:'text',   placeholder:'City, State',         required:false },
            ].map(field => (
              <div key={field.name} style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'0.05em' }}>{field.label}</label>
                <input name={field.name} type={field.type} value={form[field.name]} onChange={handle}
                  style={{ padding:'10px 12px', background:'var(--bg-secondary)', border:'1px solid var(--border-dark)', borderRadius:'8px', color:'var(--text-primary)', fontSize:'13px' }}
                  placeholder={field.placeholder} required={field.required} />
              </div>
            ))}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'0.05em' }}>Gender</label>
              <select name="gender" value={form.gender} onChange={handle} style={{ padding:'10px 12px', background:'var(--bg-secondary)', border:'1px solid var(--border-dark)', borderRadius:'8px', color:'var(--text-primary)', fontSize:'13px' }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'11px', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', letterSpacing:'0.05em' }}>Blood Type</label>
              <select name="blood_type" value={form.blood_type} onChange={handle} style={{ padding:'10px 12px', background:'var(--bg-secondary)', border:'1px solid var(--border-dark)', borderRadius:'8px', color:'var(--text-primary)', fontSize:'13px' }}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bt => <option key={bt}>{bt}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'10px 20px', background:'transparent', border:'1px solid var(--border-dark)', borderRadius:'8px', color:'var(--text-secondary)', fontSize:'14px', cursor:'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding:'10px 24px', background:'var(--accent)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer' }} disabled={loading}>{loading ? 'Adding...' : 'Add Patient'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}