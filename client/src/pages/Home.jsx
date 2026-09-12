import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  }

  const services = [
    { icon:'🫀', title:'Cardiology',      desc:'Advanced heart care with state-of-the-art diagnostics and treatment' },
    { icon:'🧠', title:'Neurology',        desc:'Expert neurological care for brain and nervous system conditions' },
    { icon:'🦴', title:'Orthopedics',      desc:'Comprehensive bone, joint and muscle care and surgery' },
    { icon:'👁️', title:'Ophthalmology',    desc:'Complete eye care from routine checkups to advanced surgery' },
    { icon:'🫁', title:'Pulmonology',      desc:'Specialized respiratory and lung disease management' },
    { icon:'👶', title:'Pediatrics',       desc:'Dedicated child healthcare from birth through adolescence' },
    { icon:'🦷', title:'Dental Care',      desc:'Full-service dental treatments in a comfortable environment' },
    { icon:'🩺', title:'General Medicine', desc:'Primary care and preventive health services for all ages' },
  ];

  const doctors = [
    { name:'Dr. Ananya Sharma', spec:'Chief Cardiologist',   exp:'18 yrs', img:'👩‍⚕️' },
    { name:'Dr. Rajesh Nair',   spec:'Senior Neurologist',   exp:'15 yrs', img:'👨‍⚕️' },
    { name:'Dr. Priya Menon',   spec:'Orthopedic Surgeon',   exp:'12 yrs', img:'👩‍⚕️' },
    { name:'Dr. Suresh Kumar',  spec:'Pediatric Specialist', exp:'20 yrs', img:'👨‍⚕️' },
  ];

  const stats = [
    { value:'1+',   label:'Years of Excellence' },
    { value:'500+', label:'Patients Treated' },
    { value:'20+',  label:'Expert Doctors' },
    { value:'98%',  label:'Patient Satisfaction' },
  ];

  return (
    <div style={{ background:'var(--white)', minHeight:'100vh' }}>

      {/* NAVBAR */}
      <nav style={{ ...n.nav, background: scrolled ? 'rgba(250,250,248,0.97)' : 'transparent', boxShadow: scrolled ? 'var(--shadow-sm)' : 'none', backdropFilter: scrolled ? 'blur(10px)' : 'none' }}>
        <div style={n.inner}>
          <div style={n.logo} onClick={() => scrollTo('home')}>
            <img src="/images/logo.png" alt="logo" style={n.logoImg} onError={e => { e.target.style.display='none'; }} />
            <div>
              <div style={n.logoName}>Mavaji's</div>
              <div style={n.logoSub}>HOSPITAL · EST. 2025</div>
            </div>
          </div>
          <div style={n.links}>
            {[['home','Home'],['services','Services'],['doctors','Doctors'],['appointment','Appointment'],['about','About']].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={n.link}>{label}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <button onClick={() => navigate('/login')} style={n.staffBtn}>Staff Portal</button>
            <button onClick={() => scrollTo('appointment')} style={n.bookBtn}>Book Now</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" style={h.section}>
        <div style={h.bg} />
        <div style={h.overlay} />
        <div style={h.content}>
          <div style={h.badge}><span style={h.badgeDot} /> Trusted Healthcare Since 2025 · Mangaluru</div>
          <h1 style={h.title}>Your Health,<br /><em style={h.titleItalic}>Our Priority</em></h1>
          <p style={h.subtitle}>Mavaji's Hospital delivers world-class medical care with compassion, precision and the latest technology. Your well-being is our mission.</p>
          <div style={{ display:'flex', gap:'14px', marginBottom:'60px', flexWrap:'wrap' }}>
            <button onClick={() => scrollTo('appointment')} style={h.primaryBtn}>Book Appointment</button>
            <button onClick={() => scrollTo('services')} style={h.secondaryBtn}>Our Services →</button>
          </div>
          <div style={{ display:'flex', gap:'40px', flexWrap:'wrap' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'32px', fontWeight:'700', color:'var(--gold)' }}>{s.value}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', fontWeight:'500', marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={h.floatingCard}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10B981', boxShadow:'0 0 6px #10B981' }} />
            <span style={{ fontSize:'10px', color:'#10B981', fontFamily:'var(--font-mono)', fontWeight:'500' }}>Emergency 24/7</span>
          </div>
          <div style={{ fontSize:'15px', fontWeight:'700', color:'var(--text-dark)', marginBottom:'6px', fontFamily:'var(--font-heading)' }}>Need urgent care?</div>
          <div style={{ fontSize:'14px', color:'var(--teal)', fontWeight:'700', marginBottom:'12px' }}>📞 94836 59165</div>
          <div style={{ height:'1px', background:'var(--border)', marginBottom:'10px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'12px', color:'var(--text-light)' }}>ICU Beds</span>
            <span style={{ fontSize:'12px', color:'#10B981', fontWeight:'600' }}>Available</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'12px', color:'var(--text-light)' }}>Ambulance</span>
            <span style={{ fontSize:'12px', color:'#10B981', fontWeight:'600' }}>On Call</span>
          </div>
          <div style={{ height:'1px', background:'var(--border)', marginBottom:'10px' }} />
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:'12px', color:'var(--text-light)' }}>Main Line</span>
            <span style={{ fontSize:'12px', color:'var(--teal)', fontWeight:'600' }}>81470 32367</span>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding:'80px 0', background:'var(--white)' }}>
        <div style={sec.inner}>
          <div style={sec.header}>
            <div style={sec.pill}>Our Specialities</div>
            <h2 style={sec.title}>Comprehensive Medical Services</h2>
            <p style={sec.subtitle}>From routine check-ups to complex surgeries, we offer complete healthcare under one roof.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px' }}>
            {services.map((svc, i) => (
              <div key={i} style={sec.card}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; e.currentTarget.style.borderColor='var(--teal)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.borderColor='var(--border)'; }}
              >
                <div style={{ fontSize:'32px', marginBottom:'14px' }}>{svc.icon}</div>
                <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'17px', fontWeight:'600', color:'var(--text-dark)', marginBottom:'8px' }}>{svc.title}</h3>
                <p style={{ fontSize:'13px', color:'var(--text-light)', lineHeight:'1.6', marginBottom:'16px' }}>{svc.desc}</p>
                <button onClick={() => scrollTo('appointment')} style={{ background:'none', border:'none', color:'var(--teal)', fontSize:'13px', fontWeight:'600', cursor:'pointer', padding:0 }}>Book →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" style={{ background:'var(--teal-light)', padding:'80px 0' }}>
        <div style={sec.inner}>
          <div style={sec.header}>
            <div style={sec.pill}>Meet Our Team</div>
            <h2 style={sec.title}>Expert Doctors at Your Service</h2>
            <p style={sec.subtitle}>Our team of highly qualified specialists are committed to providing the best possible care.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px' }}>
            {doctors.map((dr, i) => (
              <div key={i} style={doc.card}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              >
                <div style={{ fontSize:'52px', marginBottom:'16px' }}>{dr.img}</div>
                <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'17px', fontWeight:'600', color:'var(--text-dark)', marginBottom:'6px' }}>{dr.name}</h3>
                <p style={{ fontSize:'13px', color:'var(--teal)', fontWeight:'600', marginBottom:'10px' }}>{dr.spec}</p>
                <div style={{ display:'inline-block', background:'var(--teal-light)', color:'var(--teal)', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', marginBottom:'16px' }}>{dr.exp} Experience</div>
                <button onClick={() => scrollTo('appointment')} style={{ width:'100%', padding:'10px', background:'var(--teal)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>Book Appointment</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPOINTMENT */}
      <section id="appointment" style={{ padding:'80px 0', background:'var(--white)' }}>
        <div style={sec.inner}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center' }}>
            <div>
              <div style={sec.pill}>Book Online</div>
              <h2 style={{ ...sec.title, textAlign:'left', marginBottom:'16px' }}>Schedule Your Appointment</h2>
              <p style={{ ...sec.subtitle, textAlign:'left', marginBottom:'32px' }}>Book with our specialists in minutes. We will confirm within 2 hours.</p>
              {[
                { icon:'📅', title:'Flexible Timing',    desc:'Morning, afternoon and evening slots available' },
                { icon:'✅', title:'Quick Confirmation',  desc:'Get call or SMS confirmation within 2 hours' },
                { icon:'🔒', title:'Secure and Private', desc:'Your health data is always protected' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'20px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--text-dark)', marginBottom:'4px' }}>{item.title}</div>
                    <div style={{ fontSize:'13px', color:'var(--text-light)', lineHeight:'1.5' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ background:'var(--teal-light)', border:'1px solid rgba(11,110,110,0.2)', borderRadius:'12px', padding:'16px 20px' }}>
                <div style={{ fontSize:'13px', color:'var(--teal)', fontWeight:'600', marginBottom:'6px' }}>📞 Need to call us directly?</div>
                <div style={{ fontSize:'22px', fontWeight:'700', color:'var(--teal)', fontFamily:'var(--font-heading)', marginBottom:'4px' }}>81470 32367</div>
                <div style={{ fontSize:'13px', color:'var(--text-mid)' }}>Emergency: <strong>94836 59165</strong> (24/7)</div>
              </div>
            </div>
            <AppointmentForm />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ background:'var(--teal)', padding:'80px 0' }}>
        <div style={sec.inner}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-block', background:'rgba(255,255,255,0.2)', color:'#fff', padding:'6px 18px', borderRadius:'20px', fontSize:'13px', fontWeight:'600', marginBottom:'16px' }}>Our Story</div>
              <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(28px,4vw,42px)', fontWeight:'700', color:'#fff', marginBottom:'14px', lineHeight:'1.25' }}>A New Era of Healing<br /><em>in Mangaluru</em></h2>
              <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', lineHeight:'1.8', marginBottom:'24px' }}>Founded in 2025, Mavaji's Hospital was built with a simple mission — to bring world-class, compassionate healthcare to every patient in Mangaluru and the surrounding region.</p>
              <div style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'12px', padding:'20px 24px' }}>
                {[
                  { icon:'📍', text:'Adyar Garden, Mangaluru, Karnataka' },
                  { icon:'📞', text:'81470 32367' },
                  { icon:'🚨', text:'94836 59165 (Emergency 24/7)' },
                  { icon:'✉️', text:'nikhilhubballi40@gmail.com' },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'12px', fontSize:'14px', color:'rgba(255,255,255,0.85)' }}>
                    <span>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {[
                { value:'50+',  label:'Hospital Beds',      icon:'🛏️' },
                { value:'20+',  label:'Specialist Doctors', icon:'👨‍⚕️' },
                { value:'24/7', label:'Emergency Services', icon:'🚨' },
                { value:'8+',   label:'Departments',        icon:'🏥' },
              ].map((item, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'14px', padding:'24px', textAlign:'center' }}>
                  <div style={{ fontSize:'28px', marginBottom:'10px' }}>{item.icon}</div>
                  <div style={{ fontFamily:'var(--font-heading)', fontSize:'28px', fontWeight:'700', color:'#fff', marginBottom:'4px' }}>{item.value}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:'500' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'var(--text-dark)', padding:'60px 0 0' }}>
        <div style={sec.inner}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr', gap:'40px', paddingBottom:'40px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <img src="/images/logo.png" alt="logo" style={{ width:'48px', height:'48px', borderRadius:'50%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                <div>
                  <div style={{ fontFamily:'var(--font-heading)', fontSize:'18px', fontWeight:'700', color:'#fff' }}>Mavaji's Hospital</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontFamily:'var(--font-mono)', marginTop:'2px' }}>Est. 2025 · Mangaluru</div>
                </div>
              </div>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', lineHeight:'1.7' }}>Delivering compassionate, world-class healthcare in Mangaluru since 2025.</p>
            </div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'#fff', marginBottom:'16px', letterSpacing:'0.08em', fontFamily:'var(--font-mono)' }}>Quick Links</div>
              {[['home','Home'],['services','Services'],['doctors','Doctors'],['appointment','Appointment'],['about','About']].map(([id,label]) => (
                <div key={id} style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'10px', cursor:'pointer' }} onClick={() => scrollTo(id)}>{label}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'#fff', marginBottom:'16px', letterSpacing:'0.08em', fontFamily:'var(--font-mono)' }}>Departments</div>
              {['Cardiology','Neurology','Orthopedics','Pediatrics','Dental Care','General Medicine'].map(d => (
                <div key={d} style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'10px' }}>{d}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'#fff', marginBottom:'16px', letterSpacing:'0.08em', fontFamily:'var(--font-mono)' }}>Contact Us</div>
              {[
                '📍 Adyar Garden, Mangaluru, Karnataka',
                '📞 81470 32367',
                '🚨 94836 59165 (Emergency)',
                '✉️ nikhilhubballi40@gmail.com',
                '🕐 24/7 Emergency Services',
              ].map((item, i) => (
                <div key={i} style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'10px', lineHeight:'1.5' }}>{item}</div>
              ))}
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'14px 16px', marginTop:'16px' }}>
                <div style={{ fontSize:'12px', color:'#FCA5A5', fontFamily:'var(--font-mono)', fontWeight:'600', marginBottom:'4px' }}>🚨 Emergency</div>
                <div style={{ fontSize:'20px', fontWeight:'700', color:'#fff', fontFamily:'var(--font-heading)', marginBottom:'2px' }}>94836 59165</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Available Round the Clock</div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 0', fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>
            <span>© 2025 Mavaji's Hospital, Mangaluru. All rights reserved.</span>
            <button onClick={() => navigate('/login')} style={{ background:'none', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'6px', padding:'6px 14px', fontSize:'12px', color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>Staff Portal Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AppointmentForm() {
  const [form, setForm]           = useState({ name:'', phone:'', email:'', dept:'', date:'', time:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const depts = ['Cardiology','Neurology','Orthopedics','Ophthalmology','Pediatrics','Dental Care','General Medicine','Pulmonology'];
  const times = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

  function handle(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name:form.name, phone:form.phone, email:form.email, dept:form.dept, date:form.date, time:form.time, message:form.message }),
      });
      if (res.ok) { setSubmitted(true); }
      else { alert('Booking failed. Please try again.'); }
    } catch { alert('Could not connect to server.'); }
    finally { setLoading(false); }
  }

  if (submitted) return (
    <div style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:'16px', padding:'40px', textAlign:'center', boxShadow:'var(--shadow-md)' }}>
      <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'#D1FAE5', color:'#10B981', fontSize:'28px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontWeight:'700' }}>✓</div>
      <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'22px', fontWeight:'700', color:'var(--text-dark)', marginBottom:'12px' }}>Appointment Booked!</h3>
      <p style={{ fontSize:'14px', color:'var(--text-light)', lineHeight:'1.7', marginBottom:'16px' }}>Thank you, <strong>{form.name}</strong>! Your appointment for <strong>{form.dept}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong> has been received. We will confirm via call to <strong>{form.phone}</strong>.</p>
      <button onClick={() => { setSubmitted(false); setForm({ name:'',phone:'',email:'',dept:'',date:'',time:'',message:'' }); }} style={{ padding:'10px 24px', background:'var(--teal)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>Book Another</button>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:'16px', padding:'32px', boxShadow:'var(--shadow-md)' }}>
      <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'20px', fontWeight:'600', color:'var(--text-dark)', marginBottom:'24px' }}>Fill in Your Details</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Full Name *</label>
          <input name="name" value={form.name} onChange={handle} style={af.input} placeholder="Your full name" required />
        </div>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Phone Number *</label>
          <input name="phone" value={form.phone} onChange={handle} style={af.input} placeholder="+91 81470 32367" required />
        </div>
      </div>
      <div style={{ marginBottom:'16px' }}>
        <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Email Address</label>
        <input name="email" type="email" value={form.email} onChange={handle} style={af.input} placeholder="your@email.com" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Department *</label>
          <select name="dept" value={form.dept} onChange={handle} style={af.input} required>
            <option value="">Select department</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Preferred Time *</label>
          <select name="time" value={form.time} onChange={handle} style={af.input} required>
            <option value="">Select time</option>
            {times.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:'16px' }}>
        <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Preferred Date *</label>
        <input name="date" type="date" value={form.date} onChange={handle} style={af.input} required min={new Date().toISOString().split('T')[0]} />
      </div>
      <div style={{ marginBottom:'16px' }}>
        <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-mid)', marginBottom:'6px' }}>Symptoms</label>
        <textarea name="message" value={form.message} onChange={handle} style={{ ...af.input, height:'80px', resize:'vertical' }} placeholder="Brief description..." />
      </div>
      <button type="submit" style={af.submitBtn} disabled={loading}>{loading ? '⏳ Booking...' : '📅 Confirm Appointment'}</button>
      <p style={{ fontSize:'12px', color:'var(--text-light)', textAlign:'center', marginTop:'12px' }}>Or call: <strong style={{ color:'var(--teal)' }}>81470 32367</strong></p>
    </form>
  );
}

const n = {
  nav:      { position:'fixed', top:0, left:0, right:0, zIndex:100, transition:'all 0.3s', padding:'0 32px' },
  inner:    { maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'70px' },
  logo:     { display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' },
  logoImg:  { width:'44px', height:'44px', borderRadius:'50%', objectFit:'cover' },
  logoName: { fontFamily:'var(--font-heading)', fontSize:'18px', fontWeight:'700', color:'var(--teal)', lineHeight:'1.1' },
  logoSub:  { fontSize:'9px', letterSpacing:'0.15em', color:'var(--text-light)', fontFamily:'var(--font-mono)' },
  links:    { display:'flex', alignItems:'center', gap:'4px' },
  link:     { background:'none', border:'none', padding:'8px 14px', fontSize:'14px', color:'var(--text-mid)', cursor:'pointer', borderRadius:'8px', fontWeight:'500' },
  staffBtn: { padding:'8px 16px', background:'transparent', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'13px', color:'var(--text-mid)', cursor:'pointer', fontWeight:'500' },
  bookBtn:  { padding:'8px 18px', background:'var(--teal)', border:'none', borderRadius:'8px', fontSize:'13px', color:'#fff', cursor:'pointer', fontWeight:'600' },
};

const h = {
  section:     { minHeight:'100vh', position:'relative', display:'flex', alignItems:'center', paddingTop:'70px', overflow:'hidden' },
  bg:          { position:'absolute', inset:0, background:'linear-gradient(135deg, #0B6E6E 0%, #085858 40%, #1A1A2E 100%)' },
  overlay:     { position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 70% 50%, rgba(201,151,58,0.15) 0%, transparent 60%)' },
  content:     { position:'relative', zIndex:1, maxWidth:'1200px', margin:'0 auto', padding:'80px 32px', flex:1 },
  badge:       { display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'20px', padding:'6px 16px', fontSize:'13px', color:'rgba(255,255,255,0.9)', marginBottom:'28px', fontWeight:'500' },
  badgeDot:    { width:'7px', height:'7px', borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 8px #4ADE80' },
  title:       { fontFamily:'var(--font-heading)', fontSize:'clamp(40px,6vw,72px)', fontWeight:'700', color:'#fff', lineHeight:'1.15', marginBottom:'20px' },
  titleItalic: { color:'var(--gold)', fontStyle:'italic' },
  subtitle:    { fontSize:'17px', color:'rgba(255,255,255,0.75)', lineHeight:'1.7', maxWidth:'520px', marginBottom:'36px' },
  primaryBtn:  { padding:'14px 28px', background:'var(--gold)', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'600', color:'#fff', cursor:'pointer' },
  secondaryBtn:{ padding:'14px 28px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'10px', fontSize:'15px', fontWeight:'500', color:'#fff', cursor:'pointer' },
  floatingCard:{ position:'absolute', right:'8%', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.97)', borderRadius:'16px', padding:'24px', width:'230px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', zIndex:2, animation:'float 4s ease-in-out infinite' },
};

const sec = {
  inner:    { maxWidth:'1200px', margin:'0 auto', padding:'0 32px' },
  header:   { textAlign:'center', marginBottom:'56px' },
  pill:     { display:'inline-block', background:'var(--teal-light)', color:'var(--teal)', padding:'6px 18px', borderRadius:'20px', fontSize:'13px', fontWeight:'600', marginBottom:'16px', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' },
  title:    { fontFamily:'var(--font-heading)', fontSize:'clamp(28px,4vw,42px)', fontWeight:'700', color:'var(--text-dark)', marginBottom:'14px', lineHeight:'1.25' },
  subtitle: { fontSize:'16px', color:'var(--text-light)', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' },
  card:     { background:'var(--white)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px 20px', cursor:'pointer', transition:'all 0.25s', boxShadow:'var(--shadow-sm)' },
};

const doc = {
  card: { background:'var(--white)', borderRadius:'16px', padding:'28px 20px', textAlign:'center', boxShadow:'var(--shadow-md)', transition:'all 0.25s' },
};

const af = {
  input:     { width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'14px', color:'var(--text-dark)', background:'var(--off-white)', outline:'none' },
  submitBtn: { width:'100%', padding:'13px', background:'var(--teal)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginTop:'4px' },
};