import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Inline Medical SVG Icons for clean, high-performance rendering without external asset dependencies
const Icons = {
  Cross: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16m-8-8h16" />
    </svg>
  ),
  HeartPulse: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.78" />
    </svg>
  ),
  Brain: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
    </svg>
  ),
  Bone: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 1 0 7c-.9 0-1.8-.3-2.5-1l-10 1c-.7.7-1 1.6-1 2.5a3.5 3.5 0 1 1-7 0c0-.9.3-1.8 1-2.5l10-10c-.7-.7-.3-1.8-.3-2.5a3.5 3.5 0 1 1 7 0c0 .9-.3 1.8-1 2.5l10 1c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 1 0 7c-.9 0-1.8-.3-2.5-1Z" />
    </svg>
  ),
  Eye: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Lungs: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13m-2-9a4 4 0 0 0-4 4v5a4 4 0 0 0 4 4h1a1 1 0 0 0 1-1v-8m2 0a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-1a1 1 0 0 1-1-1v-8" />
    </svg>
  ),
  Child: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  PhoneCall: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Award: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
};

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSelectDoctor(doctorName, deptName) {
    setSelectedDoctorForBooking(doctorName);
    scrollTo('appointment');
  }

  const specialities = [
    {
      id: 'cardio',
      name: 'Cardiology',
      icon: <Icons.HeartPulse />,
      color: '#0A4DA2',
      bgLight: '#EBF3FC',
      head: 'Dr. Ananya Sharma',
      desc: 'Comprehensive cardiovascular care including 24/7 Primary Angioplasty, non-invasive cardiology, and cardiac rehabilitation.',
      treatments: ['ECG & 2D Echo', 'Angiography', 'Pacemaker Implantation', 'Heart Failure Clinic']
    },
    {
      id: 'neuro',
      name: 'Neurology & Neurosurgery',
      icon: <Icons.Brain />,
      color: '#0D9488',
      bgLight: '#F0FDFA',
      head: 'Dr. Rajesh Nair',
      desc: 'Expert management of stroke, epilepsy, neuro-trauma, spine disorders, and complex brain surgeries with precision navigation.',
      treatments: ['Acute Stroke Care', 'EEG & EMG Labs', 'Minimally Invasive Spine', 'Epilepsy Clinic']
    },
    {
      id: 'ortho',
      name: 'Orthopedics & Joint Care',
      icon: <Icons.Bone />,
      color: '#B45309',
      bgLight: '#FFFBEB',
      head: 'Dr. Priya Menon',
      desc: 'Advanced robotic-assisted joint replacement, sports injury rehabilitation, complex fracture fixation, and spine stabilization.',
      treatments: ['Knee & Hip Replacement', 'Arthroscopic Surgery', 'Complex Trauma', 'Sports Medicine']
    },
    {
      id: 'pedia',
      name: 'Pediatrics & Neonatology',
      icon: <Icons.Child />,
      color: '#059669',
      bgLight: '#ECFDF5',
      head: 'Dr. Suresh Kumar',
      desc: 'Compassionate pediatric healthcare from newborn intensive care (NICU Level III) to adolescent wellness and immunizations.',
      treatments: ['Newborn Care & NICU', 'Pediatric ICU', 'Childhood Vaccinations', 'Growth Assessment']
    },
    {
      id: 'pulmo',
      name: 'Pulmonology',
      icon: <Icons.Lungs />,
      color: '#4F46E5',
      bgLight: '#EEF2FF',
      head: 'Dr. Rohan Deshmukh',
      desc: 'Specialized diagnosis and therapy for asthma, COPD, pulmonary fibrosis, interstitial lung disease, and sleep apnea.',
      treatments: ['PFT & Spirometry', 'Bronchoscopy Suite', 'Sleep Study Lab', 'Allergy Management']
    },
    {
      id: 'opht',
      name: 'Ophthalmology',
      icon: <Icons.Eye />,
      color: '#0284C7',
      bgLight: '#F0F9FF',
      head: 'Dr. Meera Kamath',
      desc: 'Advanced micro-incision cataract surgery, glaucoma filtration, retina evaluations, and diabetic eye care screenings.',
      treatments: ['Phaco Cataract Surgery', 'Glaucoma Care', 'Diabetic Retinopathy', 'Refractive Consult']
    },
    {
      id: 'emergency',
      name: '24/7 Trauma & Emergency',
      icon: <Icons.Activity />,
      color: '#DC2626',
      bgLight: '#FEF2F2',
      head: 'Emergency Medical Team',
      desc: 'Immediate resuscitation, dedicated trauma suites, bedside triage, and on-call surgical teams operating 24 hours every day.',
      treatments: ['Cardiac Triage (< 5m)', 'Polytrauma Care', 'Burn Resuscitation', 'Toxicology Management']
    },
    {
      id: 'general',
      name: 'Internal Medicine',
      icon: <Icons.Cross />,
      color: '#1E293B',
      bgLight: '#F8FAFC',
      head: 'Dr. Arjun Rao',
      desc: 'Holistic clinical assessments, chronic disease management (Diabetes, Hypertension), executive health packages, and preventive care.',
      treatments: ['Diabetic Care Clinic', 'Hypertension & Lipid', 'Infectious Diseases', 'Master Health Checkups']
    }
  ];

  const doctors = [
    {
      name: 'Dr. Ananya Sharma',
      qual: 'MBBS, MD, DM (Cardiology), FACC',
      dept: 'Cardiology',
      role: 'Head & Chief Interventional Cardiologist',
      exp: '18+ Years Experience',
      timings: 'Mon – Sat: 09:30 AM – 02:00 PM',
      rating: '4.9',
      reviews: '310+ Reviews'
    },
    {
      name: 'Dr. Rajesh Nair',
      qual: 'MBBS, MS, MCh (Neurosurgery), FINR',
      dept: 'Neurology & Neurosurgery',
      role: 'Director of Neurosciences & Spine Center',
      exp: '15+ Years Experience',
      timings: 'Mon – Fri: 10:00 AM – 03:00 PM',
      rating: '4.9',
      reviews: '245+ Reviews'
    },
    {
      name: 'Dr. Priya Menon',
      qual: 'MBBS, MS (Orthopedics), Fellowship Joint Care (UK)',
      dept: 'Orthopedics & Joint Care',
      role: 'Senior Robotic Joint Replacement Surgeon',
      exp: '12+ Years Experience',
      timings: 'Mon – Sat: 11:00 AM – 04:30 PM',
      rating: '4.8',
      reviews: '190+ Reviews'
    },
    {
      name: 'Dr. Suresh Kumar',
      qual: 'MBBS, MD (Pediatrics), DCH, FIAP',
      dept: 'Pediatrics & Neonatology',
      role: 'Senior Consultant & Chief Neonatologist',
      exp: '20+ Years Experience',
      timings: 'Mon – Sat: 09:00 AM – 01:00 PM',
      rating: '5.0',
      reviews: '410+ Reviews'
    },
    {
      name: 'Dr. Arjun Rao',
      qual: 'MBBS, MD (General Medicine), FCCP',
      dept: 'Internal Medicine',
      role: 'Chief Medical Consultant & Critical Care Lead',
      exp: '10+ Years Experience',
      timings: 'Mon – Sat: 08:30 AM – 05:00 PM',
      rating: '4.8',
      reviews: '160+ Reviews'
    }
  ];

  const facilities = [
    {
      title: 'State-of-the-Art Modular OTs',
      desc: 'Equipped with laminar airflow, HEPA filtration systems, and full HD laparoscopic visualization.',
      badge: 'Sterile Zone Class 100'
    },
    {
      title: '3T MRI & 128-Slice Low-Dose CT',
      desc: 'Rapid diagnostic imaging with sub-millimeter precision, minimizing radiation exposure for patients.',
      badge: '24/7 Radiology'
    },
    {
      title: 'NABL-Accredited Automated Lab',
      desc: 'Fully automated biochemistry, pathology, and microbiology reporting directly linked to digital EHR.',
      badge: 'Accredited Excellence'
    },
    {
      title: 'NIST Zero Trust EHR Infrastructure',
      desc: 'Your medical health records are encrypted, role-restricted, and strictly protected against unauthorized access.',
      badge: 'Zero Trust Certified'
    },
    {
      title: 'Advanced ICU & Critical Care Unit',
      desc: '1:1 nursing ratio with centralized hemodynamic monitoring and invasive ventilator support.',
      badge: 'Continuous Monitoring'
    },
    {
      title: '24/7 Automated Pharmacy',
      desc: 'Complete inventory of life-saving therapeutics, genuine branded medications, and temperature-controlled storage.',
      badge: 'Open 24/7'
    }
  ];

  const testimonials = [
    {
      patient: 'Ramesh K. Hegde',
      treatment: 'Cardiac Angioplasty Patient',
      text: 'The emergency response was extraordinarily fast. Dr. Ananya Sharma and her team initiated the cath lab procedure within 20 minutes of arrival. Today I am healthy and back to work. Forever grateful to Mavaji\'s Hospital!',
      stars: 5,
      date: 'August 2026'
    },
    {
      patient: 'Sunita D\'Souza',
      treatment: 'Total Knee Replacement',
      text: 'Dr. Priya Menon explained the robotic knee surgery clearly and patiently. The nursing team was attentive round the clock. I walked on the second day post-op. A truly world-class experience right here in Mangaluru.',
      stars: 5,
      date: 'July 2026'
    },
    {
      patient: 'Venkatesh Rao',
      treatment: 'Pediatric Care for Son',
      text: 'Dr. Suresh Kumar cared for our newborn son in the NICU with profound dedication. The doctors and staff treated us like family, and the digital health reports were available instantly on our phones.',
      stars: 5,
      date: 'September 2026'
    }
  ];

  const filteredSpecialities = selectedDeptFilter === 'All' 
    ? specialities 
    : specialities.filter(s => s.name.toLowerCase().includes(selectedDeptFilter.toLowerCase()));

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>
      
      {/* 1. TOP EMERGENCY & ACCREDITATION RIBBON */}
      <div style={styles.topRibbon}>
        <div style={styles.containerFlex}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={styles.pulseDot} />
              <span style={{ fontWeight: '600', color: '#DC2626', fontSize: '12px', letterSpacing: '0.04em' }}>24/7 EMERGENCY & TRAUMA:</span>
              <a href="tel:9483659165" style={{ color: '#0F172A', fontWeight: '700', textDecoration: 'none', fontSize: '13px' }}>+91 94836 59165</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
              <span style={{ color: '#10B981' }}>●</span>
              <span>ICU Beds: <strong style={{ color: '#10B981' }}>Available</strong></span>
              <span style={{ margin: '0 4px', color: '#CBD5E1' }}>|</span>
              <span>Ambulance: <strong style={{ color: '#0A4DA2' }}>Ready on Call</strong></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#475569' }}>
            <span>Adyar Garden, Mangaluru, Karnataka</span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span>OPD: 8:00 AM – 8:00 PM</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
        <div style={styles.containerFlex}>
          {/* Brand Logo */}
          <div style={styles.brand} onClick={() => scrollTo('home')}>
            <div style={styles.logoBadge}>
              <Icons.Cross />
            </div>
            <div>
              <div style={styles.brandTitle}>Mavaji's Hospital</div>
              <div style={styles.brandSubtitle}>SUPER SPECIALITY HEALTHCARE · MANGALURU</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={styles.navLinks}>
            <button onClick={() => scrollTo('services')} style={styles.navBtn}>Specialities</button>
            <button onClick={() => scrollTo('doctors')} style={styles.navBtn}>Find a Doctor</button>
            <button onClick={() => scrollTo('facilities')} style={styles.navBtn}>Facilities</button>
            <button onClick={() => scrollTo('security')} style={styles.navBtn}>Zero Trust Privacy</button>
            <button onClick={() => scrollTo('reviews')} style={styles.navBtn}>Patient Stories</button>
            <button onClick={() => scrollTo('contact')} style={styles.navBtn}>Contact</button>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/login')} 
              style={styles.staffPortalBtn}
              title="Restricted access for authorized medical personnel"
            >
              <Icons.Lock />
              <span>Staff Portal</span>
            </button>
            <button onClick={() => scrollTo('appointment')} style={styles.primaryCtaBtn}>
              <Icons.Calendar />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section id="home" style={styles.heroSection}>
        <div style={styles.heroBackground}>
          <div style={styles.heroGradients} />
        </div>
        <div style={{ ...styles.container, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center' }}>
            
            {/* Left Content */}
            <div>
              <div style={styles.heroBadge}>
                <Icons.ShieldCheck />
                <span>NIST Zero Trust Protected · NABH Certified Healthcare</span>
              </div>
              <h1 style={styles.heroHeading}>
                Advanced Clinical Care,<br />
                <span style={{ color: '#0A4DA2' }}>Rooted in Trust</span> & Precision.
              </h1>
              <p style={styles.heroParagraph}>
                Mavaji's Hospital combines world-class medical specialists, state-of-the-art diagnostic technology, and strict patient health data privacy to ensure the highest standard of healing for you and your family.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <button onClick={() => scrollTo('appointment')} style={styles.heroMainBtn}>
                  Book Doctor Appointment
                </button>
                <button onClick={() => scrollTo('services')} style={styles.heroSecondaryBtn}>
                  Explore Specialities <Icons.ArrowRight />
                </button>
                <a href="tel:9483659165" style={styles.heroEmergencyBtn}>
                  <Icons.PhoneCall /> 24/7 Emergency
                </a>
              </div>

              {/* Credential Metrics Bar */}
              <div style={styles.metricsRow}>
                <div style={styles.metricItem}>
                  <div style={styles.metricNum}>99.2%</div>
                  <div style={styles.metricLabel}>Patient Satisfaction</div>
                </div>
                <div style={styles.metricDivider} />
                <div style={styles.metricItem}>
                  <div style={styles.metricNum}>20+</div>
                  <div style={styles.metricLabel}>Senior Specialists</div>
                </div>
                <div style={styles.metricDivider} />
                <div style={styles.metricItem}>
                  <div style={styles.metricNum}>50+</div>
                  <div style={styles.metricLabel}>Inpatient ICU Beds</div>
                </div>
                <div style={styles.metricDivider} />
                <div style={styles.metricItem}>
                  <div style={styles.metricNum}>0 Breach</div>
                  <div style={styles.metricLabel}>Zero Trust Security</div>
                </div>
              </div>
            </div>

            {/* Right Live Hospital Status Widget */}
            <div style={styles.statusWidgetCard}>
              <div style={styles.statusWidgetHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.pulseDotGreen} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E', letterSpacing: '0.05em' }}>
                    HOSPITAL STATUS · LIVE
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>24x7 REAL-TIME</span>
              </div>

              <div style={styles.widgetInner}>
                <div style={styles.widgetRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.widgetIconBox}>🚨</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Trauma & Emergency</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Adyar Main Campus</div>
                    </div>
                  </div>
                  <span style={styles.badgeSuccess}>Operational</span>
                </div>

                <div style={styles.widgetRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.widgetIconBox}>🛏️</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>ICU & Critical Care</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Level 3 Intensive Care</div>
                    </div>
                  </div>
                  <span style={styles.badgeSuccess}>Beds Open</span>
                </div>

                <div style={styles.widgetRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.widgetIconBox}>🚑</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Ambulance Response</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Mangaluru City Limits</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0A4DA2' }}>&lt; 10 min ETA</span>
                </div>

                <div style={styles.widgetRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.widgetIconBox}>🧪</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Diagnostics & Lab</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Automated Pathology & MRI</div>
                    </div>
                  </div>
                  <span style={styles.badgeSuccess}>24/7 Active</span>
                </div>
              </div>

              <div style={styles.widgetFooter}>
                <div style={{ fontSize: '12px', color: '#475569' }}>Immediate Medical Assistance:</div>
                <a href="tel:8147032367" style={styles.widgetCallBtn}>
                  <Icons.PhoneCall /> 81470 32367
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ZERO TRUST PATIENT DATA SECURITY ASSURANCE */}
      <section id="security" style={styles.securitySection}>
        <div style={styles.container}>
          <div style={styles.securityCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'center' }}>
              <div>
                <div style={styles.securityPill}>
                  <Icons.ShieldCheck />
                  <span>NIST SP 800-207 Zero Trust Architecture</span>
                </div>
                <h2 style={styles.securityTitle}>
                  Your Health Data Stays Yours. Encrypted, Confidential, and Strictly Protected.
                </h2>
                <p style={styles.securityDesc}>
                  Unlike traditional systems where internal networks are vulnerable, Mavaji's Hospital enforces an uncompromising <strong>"Never Trust, Always Verify"</strong> security model. Patient health records, diagnostic scans, and lab reports are micro-segmented and accessible strictly by your verified attending physician.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                  <div style={styles.securityFeature}>
                    <div style={{ color: '#10B981', fontWeight: '700' }}>✓ Role-Based Micro-Segmentation</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Lab techs only see tests; pharmacists only see prescriptions.</div>
                  </div>
                  <div style={styles.securityFeature}>
                    <div style={{ color: '#10B981', fontWeight: '700' }}>✓ 15-Minute Re-Verification</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Short-lived cryptographic tokens prevent session hijack.</div>
                  </div>
                  <div style={styles.securityFeature}>
                    <div style={{ color: '#10B981', fontWeight: '700' }}>✓ AI Anomaly Detection</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Isolation Forest models monitor access logs for suspicious behavior.</div>
                  </div>
                  <div style={styles.securityFeature}>
                    <div style={{ color: '#10B981', fontWeight: '700' }}>✓ Immutable Audit Logs</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Every view and edit is logged with IP, device, and timestamp.</div>
                  </div>
                </div>
              </div>

              <div style={styles.securityBadgeBox}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EBF3FC', color: '#0A4DA2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icons.Lock />
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Zero Trust Certified Medical Records
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', marginBottom: '18px' }}>
                  Rest assured knowing your consultations, diagnoses, and lab results are secured against breaches under international cybersecurity frameworks.
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#ECFDF5', borderRadius: '20px', color: '#065F46', fontSize: '12px', fontWeight: '600' }}>
                  <span>🛡️</span> NIST SP 800-207 Compliant Architecture
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEDICAL SPECIALITIES & CENTERS OF EXCELLENCE */}
      <section id="services" style={styles.sectionPad}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionPill}>CENTERS OF CLINICAL EXCELLENCE</div>
            <h2 style={styles.sectionHeading}>Comprehensive Multi-Speciality Care</h2>
            <p style={styles.sectionSub}>
              From preventative consultations to complex surgical interventions, our departments are led by distinguished specialists dedicated to patient recovery.
            </p>
          </div>

          {/* Department Filter Chips */}
          <div style={styles.filterChipsRow}>
            {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Pulmonology', 'Emergency'].map(item => (
              <button 
                key={item}
                onClick={() => setSelectedDeptFilter(item)}
                style={{
                  ...styles.filterChip,
                  ...(selectedDeptFilter === item ? styles.filterChipActive : {})
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Specialities Grid */}
          <div style={styles.grid4}>
            {filteredSpecialities.map(dept => (
              <div 
                key={dept.id} 
                style={styles.specialityCard}
                className="clickable-card"
              >
                <div style={{ ...styles.specIconBadge, background: dept.bgLight, color: dept.color }}>
                  {dept.icon}
                </div>
                <h3 style={styles.specTitle}>{dept.name}</h3>
                <div style={styles.specHead}>Lead: <strong>{dept.head}</strong></div>
                <p style={styles.specDesc}>{dept.desc}</p>
                
                <div style={styles.treatmentsBox}>
                  {dept.treatments.map((t, idx) => (
                    <span key={idx} style={styles.treatmentTag}>
                      {t}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    setSelectedDoctorForBooking(dept.head);
                    scrollTo('appointment');
                  }} 
                  style={styles.specActionBtn}
                >
                  Book Department Consultation →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR MEDICAL SPECIALISTS DIRECTORY */}
      <section id="doctors" style={{ ...styles.sectionPad, background: '#F1F5F9' }}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionPill}>BOARD-CERTIFIED FACULTY</div>
            <h2 style={styles.sectionHeading}>Meet Our Senior Medical Consultants</h2>
            <p style={styles.sectionSub}>
              Our experienced physicians combine deep clinical expertise with compassionate patient communication.
            </p>
          </div>

          <div style={styles.grid4}>
            {doctors.map((dr, index) => (
              <div key={index} style={styles.doctorCard} className="clickable-card">
                {/* Doctor Avatar Badge */}
                <div style={styles.docAvatarWrap}>
                  <div style={styles.docAvatarInitial}>
                    {dr.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={styles.docVerifiedIcon} title="Verified Consultant">✓</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Icons.Star />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{dr.rating}</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>({dr.reviews})</span>
                </div>

                <h3 style={styles.docName}>{dr.name}</h3>
                <div style={styles.docRole}>{dr.role}</div>
                <div style={styles.docQual}>{dr.qual}</div>
                
                <div style={styles.docBadgeRow}>
                  <span style={styles.docBadge}>{dr.exp}</span>
                </div>

                <div style={styles.docTimings}>
                  <Icons.Clock />
                  <span>{dr.timings}</span>
                </div>

                <button 
                  onClick={() => handleSelectDoctor(dr.name, dr.dept)}
                  style={styles.docBookBtn}
                >
                  Schedule Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ADVANCED FACILITIES & HOSPITAL INFRASTRUCTURE */}
      <section id="facilities" style={styles.sectionPad}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionPill}>HOSPITAL INFRASTRUCTURE</div>
            <h2 style={styles.sectionHeading}>Modern Diagnostics & Surgical Technology</h2>
            <p style={styles.sectionSub}>
              Engineered to global healthcare standards with integrated emergency suites, advanced diagnostic imaging, and robotic surgical suites.
            </p>
          </div>

          <div style={styles.grid3}>
            {facilities.map((fac, idx) => (
              <div key={idx} style={styles.facilityCard} className="clickable-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={styles.facBadge}>{fac.badge}</span>
                  <span style={{ color: '#0A4DA2', fontSize: '18px' }}>◈</span>
                </div>
                <h3 style={styles.facTitle}>{fac.title}</h3>
                <p style={styles.facDesc}>{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE APPOINTMENT BOOKING SECTION */}
      <section id="appointment" style={{ ...styles.sectionPad, background: '#EBF3FC' }}>
        <div style={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', alignItems: 'start' }}>
            
            {/* Appointment Info Column */}
            <div>
              <div style={styles.sectionPill}>ONLINE CONSULTATION BOOKING</div>
              <h2 style={{ ...styles.sectionHeading, textAlign: 'left' }}>
                Schedule Your Visit in Less Than 2 Minutes
              </h2>
              <p style={{ ...styles.sectionSub, textAlign: 'left', marginBottom: '32px' }}>
                Book an in-person consultation with our senior specialists. You will receive an immediate confirmation, followed by an SMS reminder with doctor room details.
              </p>

              <div style={styles.benefitList}>
                <div style={styles.benefitItem}>
                  <div style={styles.benefitIcon}><Icons.Clock /></div>
                  <div>
                    <div style={styles.benefitTitle}>Zero Waiting Room Delay</div>
                    <div style={styles.benefitDesc}>Pre-scheduled time slots ensure prompt consultation without long queues.</div>
                  </div>
                </div>

                <div style={styles.benefitItem}>
                  <div style={styles.benefitIcon}><Icons.ShieldCheck /></div>
                  <div>
                    <div style={styles.benefitTitle}>Zero Trust Digital EHR</div>
                    <div style={styles.benefitDesc}>Your medical reports are automatically linked to your encrypted patient profile.</div>
                  </div>
                </div>

                <div style={styles.benefitItem}>
                  <div style={styles.benefitIcon}><Icons.PhoneCall /></div>
                  <div>
                    <div style={styles.benefitTitle}>Instant SMS & Call Confirmation</div>
                    <div style={styles.benefitDesc}>Our appointment desk verifies and assists with hospital directions and preparation.</div>
                  </div>
                </div>
              </div>

              {/* Direct Call Box */}
              <div style={styles.directCallBox}>
                <div style={{ fontSize: '13px', color: '#0A4DA2', fontWeight: '600', marginBottom: '4px' }}>
                  Prefer Booking Over Phone?
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                  +91 81470 32367
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Hospital Central Desk · 8:00 AM to 8:00 PM
                </div>
              </div>
            </div>

            {/* Appointment Booking Form Card */}
            <AppointmentBookingForm 
              preselectedDoctor={selectedDoctorForBooking} 
              onClearDoctor={() => setSelectedDoctorForBooking('')}
            />

          </div>
        </div>
      </section>

      {/* 9. PATIENT TESTIMONIALS */}
      <section id="reviews" style={styles.sectionPad}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionPill}>PATIENT EXPERIENCES</div>
            <h2 style={styles.sectionHeading}>Stories of Recovery and Compassion</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => <Icons.Star key={i} />)}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>4.9 out of 5.0</span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>based on 420+ verified reviews</span>
            </div>
          </div>

          <div style={styles.grid3}>
            {testimonials.map((item, idx) => (
              <div key={idx} style={styles.testimonialCard} className="clickable-card">
                <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                  {[...Array(item.stars)].map((_, i) => <Icons.Star key={i} />)}
                </div>
                <p style={styles.testimonialText}>"{item.text}"</p>
                <div style={styles.testimonialDivider} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={styles.testPatientName}>{item.patient}</div>
                    <div style={styles.testTreatment}>{item.treatment}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. COMPREHENSIVE INSTITUTIONAL FOOTER */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            
            {/* Column 1: Hospital Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={styles.footerLogoBadge}>
                  <Icons.Cross />
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                    Mavaji's Hospital
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '0.1em' }}>
                    SUPER SPECIALITY HEALTHCARE · MANGALURU
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.7', marginBottom: '20px' }}>
                Committed to clinical excellence, patient dignity, and advanced healthcare innovation in coastal Karnataka, safeguarded by modern Zero Trust patient privacy principles.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#CBD5E1' }}>
                <div>📍 Adyar Garden, Mangaluru, Karnataka 575007</div>
                <div>📞 Main Line: <strong>+91 81470 32367</strong></div>
                <div>🚨 Emergency (24/7): <strong style={{ color: '#F87171' }}>+91 94836 59165</strong></div>
                <div>✉️ General Inquiries: nikhilhubballi40@gmail.com</div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <div style={styles.footerColTitle}>Navigation</div>
              <div style={styles.footerLinkList}>
                <span onClick={() => scrollTo('home')} style={styles.footerLink}>Home Overview</span>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>Centers of Excellence</span>
                <span onClick={() => scrollTo('doctors')} style={styles.footerLink}>Find a Specialist</span>
                <span onClick={() => scrollTo('facilities')} style={styles.footerLink}>Hospital Facilities</span>
                <span onClick={() => scrollTo('security')} style={styles.footerLink}>Zero Trust Data Privacy</span>
                <span onClick={() => scrollTo('appointment')} style={styles.footerLink}>Schedule Appointment</span>
              </div>
            </div>

            {/* Column 3: Medical Specialities */}
            <div>
              <div style={styles.footerColTitle}>Key Specialities</div>
              <div style={styles.footerLinkList}>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>Cardiology & Angioplasty</span>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>Neurology & Neurosurgery</span>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>Robotic Joint Replacement</span>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>Pediatrics & Neonatal ICU</span>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>Pulmonology & Asthma Care</span>
                <span onClick={() => scrollTo('services')} style={styles.footerLink}>24/7 Trauma Emergency</span>
              </div>
            </div>

            {/* Column 4: Hospital Visiting & Emergency */}
            <div>
              <div style={styles.footerColTitle}>Hospital Hours</div>
              <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px' }}>
                <div><strong>Outpatient OPD:</strong> 8:00 AM – 8:00 PM</div>
                <div><strong>Inpatient Visiting:</strong> 10:00 AM – 1:00 PM & 4:30 PM – 7:30 PM</div>
                <div><strong>Emergency & ICU:</strong> Open 24 Hours / 365 Days</div>
              </div>

              <div style={styles.footerStaffCard}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                  🔒 Hospital Staff & Doctors
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                  Secure Zero Trust medical workstation login
                </div>
                <button 
                  onClick={() => navigate('/login')} 
                  style={styles.footerStaffBtn}
                >
                  <Icons.Lock /> Staff Authentication Portal
                </button>
              </div>
            </div>

          </div>

          <div style={styles.footerBottom}>
            <div>
              © 2026 Mavaji's Super Speciality Hospital, Mangaluru. All Rights Reserved. Built with NIST SP 800-207 Zero Trust Security.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Patient Rights</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Interactive Appointment Booking Form Component
function AppointmentBookingForm({ preselectedDoctor, onClearDoctor }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    dept: 'Cardiology',
    doctor: preselectedDoctor || '',
    date: '',
    time: '10:00 AM',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    if (preselectedDoctor) {
      setForm(prev => ({ ...prev, doctor: preselectedDoctor }));
    }
  }, [preselectedDoctor]);

  const departments = [
    'Cardiology',
    'Neurology & Neurosurgery',
    'Orthopedics & Joint Care',
    'Pediatrics & Neonatology',
    'Pulmonology',
    'Ophthalmology',
    'Internal Medicine',
    '24/7 Emergency & Trauma'
  ];

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM'
  ];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          dept: form.dept,
          date: form.date,
          time: form.time,
          message: form.doctor ? `Doctor: ${form.doctor} | Note: ${form.message}` : form.message
        })
      });

      if (response.ok) {
        const refId = 'MAV-' + Math.floor(100000 + Math.random() * 900000);
        setBookingRef(refId);
        setSubmitted(true);
      } else {
        alert('Unable to process appointment booking. Please verify all details and try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Could not reach the hospital appointment server. Please ensure the backend is running or call +91 81470 32367.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={formStyles.successCard}>
        <div style={formStyles.successBadge}>✓</div>
        <h3 style={formStyles.successTitle}>Appointment Scheduled Successfully</h3>
        <p style={formStyles.successSubtitle}>
          Thank you, <strong>{form.name}</strong>. Your appointment request has been logged into the hospital central database.
        </p>

        <div style={formStyles.bookingDetailsBox}>
          <div style={formStyles.detailRow}>
            <span>Booking Reference:</span>
            <strong>{bookingRef}</strong>
          </div>
          <div style={formStyles.detailRow}>
            <span>Department:</span>
            <strong>{form.dept}</strong>
          </div>
          {form.doctor && (
            <div style={formStyles.detailRow}>
              <span>Selected Doctor:</span>
              <strong>{form.doctor}</strong>
            </div>
          )}
          <div style={formStyles.detailRow}>
            <span>Appointment Date:</span>
            <strong>{form.date}</strong>
          </div>
          <div style={formStyles.detailRow}>
            <span>Scheduled Time:</span>
            <strong>{form.time}</strong>
          </div>
          <div style={formStyles.detailRow}>
            <span>Contact Mobile:</span>
            <strong>{form.phone}</strong>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
          Our Patient Desk will send an SMS confirmation and a token pass to your registered phone number.
        </p>

        <button 
          onClick={() => {
            setSubmitted(false);
            if (onClearDoctor) onClearDoctor();
            setForm({
              name: '',
              phone: '',
              email: '',
              dept: 'Cardiology',
              doctor: '',
              date: '',
              time: '10:00 AM',
              message: ''
            });
          }}
          style={formStyles.bookAnotherBtn}
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={formStyles.formCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={formStyles.cardHeading}>Patient Details & Consultation Slot</h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            All fields marked with an asterisk (*) are required.
          </p>
        </div>
        {form.doctor && (
          <div style={formStyles.doctorChip}>
            <span>👨‍⚕️ {form.doctor}</span>
            <button 
              type="button" 
              onClick={() => {
                setForm(prev => ({ ...prev, doctor: '' }));
                if (onClearDoctor) onClearDoctor();
              }}
              style={formStyles.clearDocBtn}
              title="Clear doctor"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Name and Phone */}
      <div style={formStyles.row2}>
        <div>
          <label style={formStyles.label}>PATIENT FULL NAME *</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="e.g. Sumanth Prabhu" 
            required 
            style={formStyles.input} 
          />
        </div>
        <div>
          <label style={formStyles.label}>MOBILE PHONE NUMBER *</label>
          <input 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            placeholder="+91 98765 43210" 
            required 
            style={formStyles.input} 
          />
        </div>
      </div>

      {/* Email and Department */}
      <div style={formStyles.row2}>
        <div>
          <label style={formStyles.label}>EMAIL ADDRESS (FOR REPORTS)</label>
          <input 
            name="email" 
            type="email"
            value={form.email} 
            onChange={handleChange} 
            placeholder="patient@example.com" 
            style={formStyles.input} 
          />
        </div>
        <div>
          <label style={formStyles.label}>SELECT CLINICAL SPECIALITY *</label>
          <select 
            name="dept" 
            value={form.dept} 
            onChange={handleChange} 
            style={formStyles.input}
            required
          >
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Picker */}
      <div style={{ marginBottom: '16px' }}>
        <label style={formStyles.label}>PREFERRED CONSULTATION DATE *</label>
        <input 
          name="date" 
          type="date"
          value={form.date} 
          onChange={handleChange} 
          min={new Date().toISOString().split('T')[0]}
          required 
          style={formStyles.input} 
        />
      </div>

      {/* Time Slot Chips */}
      <div style={{ marginBottom: '18px' }}>
        <label style={formStyles.label}>SELECT CONVENIENT TIME SLOT *</label>
        <div style={formStyles.slotsGrid}>
          {timeSlots.map(slot => (
            <button
              key={slot}
              type="button"
              onClick={() => setForm({ ...form, time: slot })}
              style={{
                ...formStyles.slotBtn,
                ...(form.time === slot ? formStyles.slotBtnActive : {})
              }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Brief Health Concern */}
      <div style={{ marginBottom: '20px' }}>
        <label style={formStyles.label}>PRIMARY SYMPTOMS / CLINICAL NOTES (OPTIONAL)</label>
        <textarea 
          name="message" 
          value={form.message} 
          onChange={handleChange} 
          placeholder="Describe your current health concern, previous diagnoses, or doctor preference..." 
          style={{ ...formStyles.input, height: '76px', resize: 'vertical' }}
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        style={formStyles.submitBtn} 
        disabled={loading}
      >
        {loading ? 'Confirming Appointment...' : 'Confirm Patient Appointment →'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#94A3B8' }}>
        🔒 Strictly confidential · Logged into Hospital Zero Trust Database System
      </div>
    </form>
  );
}

// Comprehensive Stylesheet
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  containerFlex: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  topRibbon: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    padding: '8px 0',
    fontSize: '12px'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#EF4444',
    boxShadow: '0 0 8px #EF4444',
    display: 'inline-block'
  },
  pulseDotGreen: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 8px #10B981',
    display: 'inline-block'
  },
  navbar: {
    position: 'sticky',
    top: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #E2E8F0',
    zIndex: 1000,
    padding: '14px 0',
    transition: 'all 0.3s ease'
  },
  navbarScrolled: {
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
    padding: '10px 0'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0A4DA2, #0D9488)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(10, 77, 162, 0.25)'
  },
  brandTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0A4DA2',
    lineHeight: '1.2'
  },
  brandSubtitle: {
    fontSize: '9px',
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: '0.1em'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: '#334155',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  staffPortalBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '600',
    padding: '8px 14px',
    cursor: 'pointer'
  },
  primaryCtaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0A4DA2',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    padding: '9px 18px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(10, 77, 162, 0.3)'
  },
  heroSection: {
    position: 'relative',
    padding: '70px 0 90px',
    overflow: 'hidden'
  },
  heroBackground: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    zIndex: 1
  },
  heroGradients: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(10, 77, 162, 0.08) 0%, transparent 50%), radial-gradient(circle at 15% 70%, rgba(13, 148, 136, 0.08) 0%, transparent 50%)'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#EBF3FC',
    border: '1px solid #BFDBFE',
    color: '#0A4DA2',
    fontSize: '12px',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '20px',
    marginBottom: '20px'
  },
  heroHeading: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(36px, 4.5vw, 56px)',
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: '1.2',
    marginBottom: '20px'
  },
  heroParagraph: {
    fontSize: '16px',
    color: '#475569',
    lineHeight: '1.75',
    maxWidth: '540px',
    marginBottom: '32px'
  },
  heroMainBtn: {
    padding: '13px 28px',
    background: '#0A4DA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(10, 77, 162, 0.35)'
  },
  heroSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '13px 22px',
    background: '#FFFFFF',
    color: '#0F172A',
    border: '1px solid #CBD5E1',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  heroEmergencyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '13px 20px',
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none'
  },
  metricsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    paddingTop: '28px',
    borderTop: '1px solid #E2E8F0',
    flexWrap: 'wrap'
  },
  metricItem: {
    textAlign: 'left'
  },
  metricNum: {
    fontFamily: 'var(--font-heading)',
    fontSize: '24px',
    fontWeight: '700',
    color: '#0A4DA2'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px'
  },
  metricDivider: {
    width: '1px',
    height: '32px',
    background: '#E2E8F0'
  },
  statusWidgetCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '18px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
    position: 'relative'
  },
  statusWidgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #F1F5F9'
  },
  widgetInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '18px 0'
  },
  widgetRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  widgetIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  badgeSuccess: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#059669',
    background: '#ECFDF5',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  widgetFooter: {
    borderTop: '1px solid #F1F5F9',
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  widgetCallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0A4DA2',
    fontWeight: '700',
    fontSize: '14px',
    textDecoration: 'none'
  },
  securitySection: {
    padding: '20px 0 50px'
  },
  securityCard: {
    background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 100%)',
    borderRadius: '24px',
    padding: '48px',
    color: '#FFFFFF',
    boxShadow: '0 20px 50px rgba(13, 27, 42, 0.2)'
  },
  securityPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#93C5FD',
    marginBottom: '16px'
  },
  securityTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: '700',
    lineHeight: '1.3',
    marginBottom: '16px'
  },
  securityDesc: {
    fontSize: '14px',
    color: '#94A3B8',
    lineHeight: '1.7',
    maxWidth: '620px'
  },
  securityFeature: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px'
  },
  securityBadgeBox: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    color: '#0F172A',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)'
  },
  sectionPad: {
    padding: '80px 0'
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 48px'
  },
  sectionPill: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0A4DA2',
    letterSpacing: '0.08em',
    marginBottom: '10px'
  },
  sectionHeading: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(28px, 3.5vw, 40px)',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '14px',
    lineHeight: '1.25'
  },
  sectionSub: {
    fontSize: '15px',
    color: '#64748B',
    lineHeight: '1.7'
  },
  filterChipsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '36px'
  },
  filterChip: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '20px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterChipActive: {
    background: '#0A4DA2',
    color: '#FFFFFF',
    borderColor: '#0A4DA2',
    boxShadow: '0 2px 8px rgba(10, 77, 162, 0.25)'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px'
  },
  specialityCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
  },
  specIconBadge: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px'
  },
  specTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '19px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '4px'
  },
  specHead: {
    fontSize: '12px',
    color: '#64748B',
    marginBottom: '12px'
  },
  specDesc: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '16px',
    flex: 1
  },
  treatmentsBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '20px'
  },
  treatmentTag: {
    fontSize: '11px',
    fontWeight: '500',
    background: '#F1F5F9',
    color: '#334155',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  specActionBtn: {
    background: 'none',
    border: 'none',
    color: '#0A4DA2',
    fontSize: '13px',
    fontWeight: '700',
    padding: '8px 0 0',
    textAlign: 'left',
    cursor: 'pointer',
    borderTop: '1px solid #F1F5F9'
  },
  doctorCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
  },
  docAvatarWrap: {
    position: 'relative',
    width: '76px',
    height: '76px',
    margin: '0 auto 16px'
  },
  docAvatarInitial: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0A4DA2, #0D9488)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
    boxShadow: '0 6px 16px rgba(10, 77, 162, 0.2)'
  },
  docVerifiedIcon: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#10B981',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    border: '2px solid #FFFFFF'
  },
  docName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '4px'
  },
  docRole: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0A4DA2',
    marginBottom: '6px'
  },
  docQual: {
    fontSize: '11px',
    color: '#64748B',
    marginBottom: '14px'
  },
  docBadgeRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '14px'
  },
  docBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#0D9488',
    background: '#F0FDFA',
    border: '1px solid #CCFBF1',
    padding: '3px 10px',
    borderRadius: '12px'
  },
  docTimings: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748B',
    marginBottom: '20px'
  },
  docBookBtn: {
    width: '100%',
    padding: '11px',
    background: '#0A4DA2',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  facilityCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
  },
  facBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0A4DA2',
    background: '#EBF3FC',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  facTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8px'
  },
  facDesc: {
    fontSize: '13px',
    color: '#64748B',
    lineHeight: '1.6'
  },
  benefitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '32px'
  },
  benefitItem: {
    display: 'flex',
    gap: '14px'
  },
  benefitIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#0A4DA2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
    flexShrink: 0
  },
  benefitTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '2px'
  },
  benefitDesc: {
    fontSize: '13px',
    color: '#64748B',
    lineHeight: '1.5'
  },
  directCallBox: {
    background: '#FFFFFF',
    border: '1px solid #BFDBFE',
    borderRadius: '14px',
    padding: '20px 24px',
    boxShadow: '0 4px 14px rgba(10, 77, 162, 0.08)'
  },
  testimonialCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  testimonialText: {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '1.7',
    fontStyle: 'italic',
    marginBottom: '18px'
  },
  testimonialDivider: {
    height: '1px',
    background: '#F1F5F9',
    marginBottom: '16px'
  },
  testPatientName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F172A'
  },
  testTreatment: {
    fontSize: '12px',
    color: '#0D9488',
    marginTop: '2px'
  },
  footer: {
    background: '#0D1B2A',
    color: '#FFFFFF',
    padding: '70px 0 30px'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr 1.2fr 1.4fr',
    gap: '40px',
    paddingBottom: '48px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  footerLogoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#0A4DA2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF'
  },
  footerColTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '0.04em',
    marginBottom: '18px'
  },
  footerLinkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerLink: {
    fontSize: '13px',
    color: '#94A3B8',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  footerStaffCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '16px'
  },
  footerStaffBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px',
    background: 'rgba(10, 77, 162, 0.5)',
    border: '1px solid rgba(147, 197, 253, 0.3)',
    borderRadius: '6px',
    color: '#93C5FD',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  footerBottom: {
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#64748B',
    flexWrap: 'wrap',
    gap: '12px'
  }
};

const formStyles = {
  formCard: {
    background: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.06)'
  },
  cardHeading: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A'
  },
  doctorChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#EBF3FC',
    color: '#0A4DA2',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600'
  },
  clearDocBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: '12px'
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '0.04em',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    background: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    transition: 'border 0.2s'
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  slotBtn: {
    padding: '8px 10px',
    background: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
  },
  slotBtnActive: {
    background: '#0A4DA2',
    color: '#FFFFFF',
    borderColor: '#0A4DA2'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#0A4DA2',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(10, 77, 162, 0.3)'
  },
  successCard: {
    background: '#FFFFFF',
    border: '1px solid #A7F3D0',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 16px 36px rgba(16, 185, 129, 0.08)'
  },
  successBadge: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#ECFDF5',
    color: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 auto 16px'
  },
  successTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '22px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8px'
  },
  successSubtitle: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  bookingDetailsBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '18px 24px',
    marginBottom: '20px',
    textAlign: 'left'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #F1F5F9',
    fontSize: '13px',
    color: '#475569'
  },
  bookAnotherBtn: {
    padding: '12px 28px',
    background: '#0A4DA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};