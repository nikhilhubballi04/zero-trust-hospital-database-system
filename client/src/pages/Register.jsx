import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublicRoles, registerUser } from '../services/api';
import { analyzeVideoFrame, extractFacialVector, averageVectors } from '../utils/faceBiometrics';

export default function Register() {
  const navigate = useNavigate();

  // Form State
  const [step, setStep] = useState(1); // 1: Staff Details, 2: Face Biometrics, 3: Completed
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);

  // Biometric Capture State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [detectionStatus, setDetectionStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Waiting for camera...');
  const [confidence, setConfidence] = useState(0);
  const [capturedSamples, setCapturedSamples] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [finalVector, setFinalVector] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const samplesRef = useRef([]);

  // Load available roles from backend
  useEffect(() => {
    getPublicRoles()
      .then(res => {
        const roles = Array.isArray(res.data) ? res.data : (res.data?.roles || []);
        setAvailableRoles(roles);
        if (roles.length > 0) {
          // Default to doctor or first role
          const defaultRole = roles.find(r => r.name === 'doctor') || roles[0];
          setSelectedRole(defaultRole.name);
        }
      })
      .catch(err => {
        console.error('Failed to load public roles', err);
        // Fallback roles if offline
        setAvailableRoles([
          { name: 'doctor', display_name: 'Doctor / Physician', clearance_level: 3, description: 'Clinical EHR & Diagnostics' },
          { name: 'nurse', display_name: 'Registered Nurse', clearance_level: 2, description: 'Inpatient Care & Vitals' },
          { name: 'lab_tech', display_name: 'Laboratory Technician', clearance_level: 2, description: 'Diagnostic Lab Reports' },
          { name: 'pharmacist', display_name: 'Clinical Pharmacist', clearance_level: 2, description: 'Medications & Prescriptions' },
          { name: 'patient', display_name: 'Patient Account', clearance_level: 1, description: 'Personal Health Records' }
        ]);
        setSelectedRole('doctor');
      });
  }, []);

  const stopCamera = useCallback(() => {
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setCameraError('');
    setStatusMessage('Requesting camera access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setStatusMessage('Position your face inside the target frame...');
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access denied or unavailable. Please grant webcam permissions to register your biometric Face ID.');
      setCameraActive(false);
    }
  }, []);

  // Run real-time detection & sampling loop
  useEffect(() => {
    if (!cameraActive || step !== 2) return;

    let lastSampleTime = 0;

    const processFrame = (timestamp) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const width = 320;
        const height = 240;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const analysis = analyzeVideoFrame(imgData.data, width, height);

        if (analysis.detected) {
          setDetectionStatus('locked');
          setConfidence(Math.round(analysis.confidence));
          setStatusMessage(analysis.message);

          // If user clicked start capture or auto-capture when face is stable
          if (isCapturing && samplesRef.current.length < 12) {
            // Throttle sampling to 1 frame every 120ms
            if (timestamp - lastSampleTime > 120) {
              lastSampleTime = timestamp;
              const vector = extractFacialVector(imgData.data, width, height, analysis.box);
              if (vector) {
                samplesRef.current = [...samplesRef.current, vector];
                setCapturedSamples([...samplesRef.current]);

                if (samplesRef.current.length >= 12) {
                  // Capture complete! Average vectors
                  const averaged = averageVectors(samplesRef.current);
                  setFinalVector(averaged);
                  setIsCapturing(false);
                  setStatusMessage('✅ Face ID template successfully generated and calibrated!');
                }
              }
            }
          }
        } else {
          setDetectionStatus(analysis.status);
          setConfidence(0);
          setStatusMessage(analysis.message);
        }
      }

      loopRef.current = requestAnimationFrame(processFrame);
    };

    loopRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (loopRef.current) {
        cancelAnimationFrame(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [cameraActive, step, isCapturing]);

  // Proceed from Step 1 to Step 2
  const handleProceedToBiometrics = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid hospital email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!selectedRole) {
      setErrorMessage('Please select an authorized clinical or technical role.');
      return;
    }

    setStep(2);
    startCamera();
  };

  // Trigger Biometric Capture
  const handleStartCapture = () => {
    samplesRef.current = [];
    setCapturedSamples([]);
    setFinalVector(null);
    setIsCapturing(true);
    setStatusMessage('Hold still · Scanning 12 biometric landmark frames...');
  };

  // Reset Biometric Capture
  const handleResetCapture = () => {
    samplesRef.current = [];
    setCapturedSamples([]);
    setFinalVector(null);
    setIsCapturing(false);
    setStatusMessage('Position your face inside the frame and click Start Biometric Scan');
  };

  // Submit complete registration
  const handleSubmitRegistration = async () => {
    if (!finalVector) {
      setErrorMessage('Biometric face scan is required. Please capture your Face ID before proceeding.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await registerUser({
        name,
        email,
        password,
        role: selectedRole,
        faceDescriptor: finalVector
      });

      stopCamera();
      setRegisteredUser(res.data?.user || { name, email, role: selectedRole });
      setStep(3);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage(err.response?.data?.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoleObj = availableRoles.find(r => r.name === selectedRole) || {
    display_name: selectedRole,
    clearance_level: 2
  };

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Background ambient lighting */}
      <div style={styles.ambientGlow} />

      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m-8-8h16" />
            </svg>
          </div>
          <div>
            <div style={styles.hospitalName}>Mavaji's Hospital</div>
            <div style={styles.systemTag}>ZERO TRUST WORKSTATION · BIOMETRIC ONBOARDING</div>
          </div>
        </div>

        <div style={styles.headerNav}>
          <span style={styles.secStatus}>ENCRYPTED BIOMETRIC REGISTRATION</span>
          <Link to="/login" style={styles.loginLink}>
            Already Registered? Staff Login →
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main style={styles.main}>
        <div style={styles.card}>

          {/* Stepper Progress */}
          <div style={styles.stepper}>
            <div style={{ ...styles.stepItem, ...(step >= 1 ? styles.stepActive : {}) }}>
              <div style={{ ...styles.stepNum, ...(step >= 1 ? styles.stepNumActive : {}) }}>1</div>
              <span style={styles.stepLabel}>Staff Profile & Role</span>
            </div>
            <div style={{ ...styles.stepLine, ...(step >= 2 ? styles.stepLineActive : {}) }} />
            <div style={{ ...styles.stepItem, ...(step >= 2 ? styles.stepActive : {}) }}>
              <div style={{ ...styles.stepNum, ...(step >= 2 ? styles.stepNumActive : {}) }}>2</div>
              <span style={styles.stepLabel}>Biometric Face ID</span>
            </div>
            <div style={{ ...styles.stepLine, ...(step >= 3 ? styles.stepLineActive : {}) }} />
            <div style={{ ...styles.stepItem, ...(step === 3 ? styles.stepActive : {}) }}>
              <div style={{ ...styles.stepNum, ...(step === 3 ? styles.stepNumActive : {}) }}>3</div>
              <span style={styles.stepLabel}>Verified & Active</span>
            </div>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div style={styles.errorBanner}>
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Staff Details & Dynamic Role Selection */}
          {step === 1 && (
            <form onSubmit={handleProceedToBiometrics} style={styles.form}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.title}>Staff Clinical Onboarding</h2>
                <p style={styles.subtitle}>
                  Register your official hospital staff profile and assign your clinical department role.
                </p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>FULL LEGAL NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>OFFICIAL HOSPITAL EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rajesh@hospital.com"
                  style={styles.input}
                  required
                />
              </div>

              {/* Dynamic Role Selector */}
              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={styles.labelNoMargin}>ASSIGNED ROLE & CLEARANCE LEVEL</label>
                  <span style={styles.clearanceBadge}>
                    Level {selectedRoleObj.clearance_level || 2} Clearance
                  </span>
                </div>

                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  style={styles.select}
                  required
                >
                  {availableRoles.map(r => (
                    <option key={r.name} value={r.name}>
                      {r.display_name || r.name.toUpperCase()} (Level {r.clearance_level || 2} Clearance)
                    </option>
                  ))}
                </select>

                {selectedRoleObj.description && (
                  <div style={styles.roleDescription}>
                    ℹ️ {selectedRoleObj.description}
                  </div>
                )}
              </div>

              {/* Password Fields */}
              <div style={styles.rowTwo}>
                <div style={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={styles.labelNoMargin}>PASSWORD</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.toggleBtn}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>CONFIRM PASSWORD</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <button type="submit" style={styles.primaryButton}>
                <span>PROCEED TO BIOMETRIC FACE ENROLLMENT</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </button>

              <div style={styles.footerHelp}>
                <span>Zero Trust Hospital Workstation · Biometric Face ID is mandatory for clinical workstations.</span>
              </div>
            </form>
          )}

          {/* STEP 2: Live Camera Biometric Face ID Registration */}
          {step === 2 && (
            <div style={styles.biometricSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.title}>Biometric Face ID Enrollment</h2>
                <p style={styles.subtitle}>
                  Register your biometric template using your live workstation camera. This face identity will be matched each time you unlock your workstation.
                </p>
              </div>

              {cameraError ? (
                <div style={styles.cameraErrorBox}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷❌</div>
                  <div style={{ fontWeight: '600', color: '#F87171' }}>Camera Permission Required</div>
                  <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px' }}>{cameraError}</div>
                  <button onClick={startCamera} style={styles.retryBtn}>
                    Try Again
                  </button>
                </div>
              ) : (
                <div style={styles.viewportContainer}>
                  <div style={styles.videoWrapper}>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={styles.video}
                    />

                    {/* Smartphone Optical Face Scanner Overlay */}
                    <div style={styles.scannerOverlay}>
                      <div
                        style={{
                          ...styles.faceGuideOval,
                          borderColor:
                            detectionStatus === 'locked'
                              ? '#10B981'
                              : detectionStatus === 'hand_covering' || detectionStatus === 'no_features'
                              ? '#EF4444'
                              : 'rgba(59, 130, 246, 0.45)',
                          boxShadow:
                            detectionStatus === 'locked'
                              ? '0 0 35px rgba(16, 185, 129, 0.4)'
                              : 'none'
                        }}
                      >
                        {detectionStatus === 'locked' && (
                          <div style={styles.scanLaser} />
                        )}
                      </div>
                    </div>

                    {/* Live Telemetry HUD Tag */}
                    <div style={styles.telemetryTag}>
                      <div
                        style={{
                          ...styles.statusIndicatorDot,
                          backgroundColor: detectionStatus === 'locked' ? '#10B981' : '#EF4444'
                        }}
                      />
                      <span>
                        {detectionStatus === 'locked'
                          ? `FACE LOCKED · ${confidence}% ACCURACY`
                          : 'REAL-TIME OPTICAL SCANNER'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Status Feedback */}
                  <div
                    style={{
                      ...styles.statusMessageBox,
                      backgroundColor:
                        detectionStatus === 'locked'
                          ? 'rgba(16, 185, 129, 0.12)'
                          : detectionStatus === 'hand_covering' || detectionStatus === 'no_features'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(30, 41, 59, 0.6)',
                      borderColor:
                        detectionStatus === 'locked'
                          ? 'rgba(16, 185, 129, 0.3)'
                          : detectionStatus === 'hand_covering' || detectionStatus === 'no_features'
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <span>{statusMessage}</span>
                  </div>

                  {/* Sampling Progress Indicator */}
                  <div style={styles.progressContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                      <span>Biometric Landmark Sampling</span>
                      <span>{capturedSamples.length} / 12 Samples Captured</span>
                    </div>
                    <div style={styles.progressBarTrack}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${Math.round((capturedSamples.length / 12) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Biometric Verification Badge when finished */}
                  {finalVector && (
                    <div style={styles.vectorSuccessBadge}>
                      <span style={{ fontSize: '18px' }}>🛡️</span>
                      <div>
                        <div style={{ fontWeight: '600', color: '#34D399', fontSize: '13px' }}>
                          16-D Anthropometric Biometric Template Ready
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                          Nodal distances, nasal contrast & bilateral skin chrominance normalized.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={styles.buttonRow}>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setStep(1);
                      }}
                      style={styles.secondaryButton}
                    >
                      ← Back to Profile
                    </button>

                    {!finalVector ? (
                      <button
                        type="button"
                        onClick={handleStartCapture}
                        disabled={isCapturing || detectionStatus !== 'locked'}
                        style={{
                          ...styles.primaryButton,
                          opacity: isCapturing || detectionStatus !== 'locked' ? 0.6 : 1,
                          cursor: isCapturing || detectionStatus !== 'locked' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isCapturing ? `SCANNING SAMPLES (${capturedSamples.length}/12)...` : 'START BIOMETRIC SCAN 📷'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                        <button
                          type="button"
                          onClick={handleResetCapture}
                          style={styles.secondaryButton}
                        >
                          Re-scan Face
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitRegistration}
                          disabled={submitting}
                          style={{ ...styles.primaryButton, flex: 1 }}
                        >
                          {submitting ? 'ENROLLING BIOMETRICS & CREATING ACCOUNT...' : 'COMPLETE REGISTRATION & ENROLL FACE →'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Registration Successful */}
          {step === 3 && (
            <div style={styles.successSection}>
              <div style={styles.successIconCircle}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 style={styles.successTitle}>Biometric Enrollment Complete!</h2>
              <p style={styles.successSub}>
                Your hospital workstation profile and Face ID template have been securely registered into the Zero Trust database.
              </p>

              <div style={styles.summaryCard}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Staff Member</span>
                  <span style={styles.summaryValue}>{registeredUser?.name || name}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Official Email</span>
                  <span style={styles.summaryValueMono}>{registeredUser?.email || email}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Assigned Role</span>
                  <span style={styles.roleTag}>
                    {(registeredUser?.role || selectedRole).replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Biometric Status</span>
                  <span style={{ color: '#10B981', fontWeight: '600', fontSize: '13px' }}>
                    ● Enrolled (16-D Vector Active)
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Security Policy</span>
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>
                    Zero Trust Continuous Verification
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate('/login')}
                  style={styles.primaryButton}
                >
                  PROCEED TO STAFF WORKSTATION LOGIN →
                </button>
                <Link to="/" style={styles.homeReturnLink}>
                  ← Return to Public Hospital Portal
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#070B19',
    color: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden'
  },
  ambientGlow: {
    position: 'absolute',
    top: '-150px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '450px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
    background: 'rgba(10, 16, 31, 0.85)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)'
  },
  hospitalName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.3px'
  },
  systemTag: {
    fontSize: '9.5px',
    color: '#60A5FA',
    fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.8px'
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  },
  secStatus: {
    fontSize: '11px',
    color: '#10B981',
    fontFamily: 'var(--font-mono, monospace)',
    padding: '4px 10px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '6px'
  },
  loginLink: {
    color: '#93C5FD',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none'
  },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '36px 16px',
    position: 'relative',
    zIndex: 1
  },
  card: {
    width: '100%',
    maxWidth: '580px',
    background: '#0D1527',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.45,
    transition: 'opacity 0.2s'
  },
  stepActive: {
    opacity: 1
  },
  stepNum: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#1E293B',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700'
  },
  stepNumActive: {
    background: '#2563EB',
    color: '#FFFFFF'
  },
  stepLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#E2E8F0'
  },
  stepLine: {
    flex: 1,
    height: '2px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '0 8px'
  },
  stepLineActive: {
    background: '#2563EB'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#F87171',
    fontSize: '13px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  sectionHeader: {
    marginBottom: '10px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.3px',
    margin: '0 0 6px 0'
  },
  subtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: 0,
    lineHeight: 1.5
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: '0.8px',
    fontFamily: 'var(--font-mono, monospace)'
  },
  labelNoMargin: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: '0.8px',
    fontFamily: 'var(--font-mono, monospace)'
  },
  clearanceBadge: {
    fontSize: '10px',
    color: '#60A5FA',
    background: 'rgba(59, 130, 246, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'var(--font-mono, monospace)'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    background: '#131D33',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    background: '#131D33',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  roleDescription: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '4px'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: '#60A5FA',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.6px',
    cursor: 'pointer',
    transition: 'transform 0.15s, opacity 0.2s',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
  },
  secondaryButton: {
    padding: '12px 18px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    color: '#CBD5E1',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  footerHelp: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '6px'
  },
  biometricSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  viewportContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '320px',
    background: '#050811',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)' // Mirror view
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  faceGuideOval: {
    width: '180px',
    height: '240px',
    borderRadius: '50%',
    border: '2px dashed rgba(59, 130, 246, 0.5)',
    position: 'relative',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  scanLaser: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
    boxShadow: '0 0 10px #10B981',
    animation: 'scanLaserMove 1.8s ease-in-out infinite alternate'
  },
  telemetryTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(10, 16, 31, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '10px',
    fontFamily: 'var(--font-mono, monospace)',
    color: '#E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusIndicatorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  statusMessageBox: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '13px',
    fontWeight: '500',
    color: '#E2E8F0',
    textAlign: 'center'
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  progressBarTrack: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3B82F6, #10B981)',
    transition: 'width 0.15s ease-out'
  },
  vectorSuccessBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '8px'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '6px'
  },
  cameraErrorBox: {
    padding: '30px 20px',
    background: '#131D33',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.25)'
  },
  retryBtn: {
    marginTop: '14px',
    padding: '8px 16px',
    background: '#2563EB',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFFFF',
    cursor: 'pointer'
  },
  successSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '10px 0'
  },
  successIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '2px solid #10B981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 8px 0'
  },
  successSub: {
    fontSize: '13px',
    color: '#94A3B8',
    maxWidth: '420px',
    lineHeight: 1.5,
    margin: '0 0 20px 0'
  },
  summaryCard: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#131D33',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'left'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    padding: '4px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  summaryLabel: {
    color: '#94A3B8'
  },
  summaryValue: {
    fontWeight: '600',
    color: '#FFFFFF'
  },
  summaryValueMono: {
    fontFamily: 'var(--font-mono, monospace)',
    color: '#93C5FD'
  },
  roleTag: {
    fontSize: '11px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono, monospace)',
    color: '#60A5FA',
    background: 'rgba(59, 130, 246, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  homeReturnLink: {
    fontSize: '12px',
    color: '#94A3B8',
    textDecoration: 'none'
  }
};
