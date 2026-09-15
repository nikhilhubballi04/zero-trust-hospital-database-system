import { useState, useEffect, useRef, useCallback } from 'react';
import { faceLoginUser, getEnrolledFaces, enrollFaceBiometric } from '../services/api';
import { detectFaceAI, loadFaceApiModels, averageVectors, getKeyLandmarks } from '../utils/faceBiometrics';


export default function FaceUnlockModal({
  isOpen,
  onClose,
  onSuccess,
  targetEmail = '',
  initialMode = 'unlock'
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const loopRef = useRef(null);
  const consecutiveFramesRef = useRef(0);
  const positiveStreakRef = useRef(0);
  const negativeStreakRef = useRef(0);
  const smoothedBoxRef = useRef(null);
  const authTriggeredRef = useRef(false);
  const scanStepRef = useRef('init');
  const matchScoreRef = useRef(0);
  const modeRef = useRef(initialMode || 'unlock');
  const collectedVectorsRef = useRef([]);
  const isProcessingRef = useRef(false);

  const [mode, setMode] = useState(initialMode || 'unlock'); // 'unlock' | 'enroll'
  const [scanStep, setScanStep] = useState('init'); // init, searching, scanning, analyzing, verified, enrolled, needs_enrollment, error
  const [statusText, setStatusText] = useState('Initializing biometric neural sensor...');
  const [progress, setProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [enrolledStaff, setEnrolledStaff] = useState([]);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState(targetEmail || '');
  const [matchScore, setMatchScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceBox, setFaceBox] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [verifiedAuthData, setVerifiedAuthData] = useState(null);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState('');

  // Sync modeRef with state
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Load enrolled clinical staff profiles from database
  const loadStaffProfiles = useCallback(() => {
    getEnrolledFaces()
      .then(res => {
        const staffList = res.data || [];
        setEnrolledStaff(staffList);
        if (targetEmail) {
          const matched = staffList.find(u => u.email === targetEmail);
          if (matched) setSelectedStaffEmail(matched.email);
        } else if (initialMode === 'enroll' && !selectedStaffEmail && staffList.length > 0) {
          const matched = staffList.find(u => u.role === 'doctor') || staffList[0];
          setSelectedStaffEmail(matched.email);
        }
        // In unlock mode with no targetEmail, leave selectedStaffEmail as "" for Auto-Identify!
      })
      .catch(() => {});
  }, [selectedStaffEmail, targetEmail, initialMode]);

  useEffect(() => {
    if (isOpen) {
      loadFaceApiModels().catch(() => {});
      loadStaffProfiles();
      if (initialMode) {
        setMode(initialMode);
        modeRef.current = initialMode;
      }
    }
  }, [isOpen, initialMode, loadStaffProfiles]);

  // Soft biometric unlock/enroll chime
  function playBiometricChime(isEnroll = false) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      if (isEnroll) {
        osc.frequency.setValueAtTime(440.0, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.18); // A5
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.12); // A5
      }
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch (e) {
      // AudioContext blocked
    }
  }

  const stopCamera = useCallback(() => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    consecutiveFramesRef.current = 0;
    positiveStreakRef.current = 0;
    negativeStreakRef.current = 0;
    smoothedBoxRef.current = null;
    authTriggeredRef.current = false;
    collectedVectorsRef.current = [];
    isProcessingRef.current = false;
  }, []);

  // Mode switcher handler (keeps camera streaming continuously)
  function handleSwitchMode(newMode) {
    setMode(newMode);
    modeRef.current = newMode;
    consecutiveFramesRef.current = 0;
    positiveStreakRef.current = 0;
    negativeStreakRef.current = 0;
    authTriggeredRef.current = false;
    collectedVectorsRef.current = [];
    isProcessingRef.current = false;
    setProgress(0);
    setVerifiedAuthData(null);
    setEnrollSuccessMessage('');

    if (newMode === 'enroll') {
      setScanStep('searching');
      scanStepRef.current = 'searching';
      setStatusText('Face ID Setup Mode · Center face to enroll biometric template');
      if (!selectedStaffEmail && enrolledStaff.length > 0) {
        const defaultStaff = enrolledStaff.find(u => u.role === 'doctor') || enrolledStaff[0];
        setSelectedStaffEmail(defaultStaff.email);
      }
    } else {
      setScanStep('searching');
      scanStepRef.current = 'searching';
      setStatusText('Unlock Mode · Optical sensor active, look at camera to unlock');
    }
  }

  // Perform Face Enrollment into MySQL database
  const performEnrollment = useCallback(async (averagedVector) => {
    if (authTriggeredRef.current) return;
    authTriggeredRef.current = true;

    const emailToUse = selectedStaffEmail || targetEmail;
    if (!emailToUse) {
      setScanStep('error');
      scanStepRef.current = 'error';
      setStatusText('Please select a staff account to enroll Face ID.');
      authTriggeredRef.current = false;
      return;
    }

    try {
      setStatusText('Saving 128-D neural biometric template to hospital database...');
      setProgress(98);

      const res = await enrollFaceBiometric({
        email: emailToUse,
        faceDescriptor: averagedVector
      });

      setScanStep('enrolled');
      scanStepRef.current = 'enrolled';
      setProgress(100);
      playBiometricChime(true);

      const successMsg = res.data?.message || `Face ID successfully enrolled in database for ${emailToUse}!`;
      setEnrollSuccessMessage(successMsg);
      setStatusText('✓ Face ID Enrolled! Deep neural template stored. Continuous camera active.');

      // Refresh staff list so it immediately shows has_descriptor = true
      getEnrolledFaces().then(r => setEnrolledStaff(r.data || [])).catch(() => {});
    } catch (err) {
      setScanStep('error');
      scanStepRef.current = 'error';
      setStatusText(err.response?.data?.message || 'Face enrollment failed. Please retry.');
      authTriggeredRef.current = false;
      collectedVectorsRef.current = [];
    }
  }, [selectedStaffEmail, targetEmail]);

  // Perform Face ID Authentication against database vector
  const performAuthentication = useCallback(async (computedScore, liveVector) => {
    if (authTriggeredRef.current) return;
    authTriggeredRef.current = true;

    try {
      const emailToUse = selectedStaffEmail || targetEmail || ''; // blank enables 1:N auto-identification!
      const res = await faceLoginUser({
        email: emailToUse,
        confidence: computedScore,
        liveDescriptor: liveVector
      });

      setVerifiedAuthData(res.data);
      setScanStep('verified');
      scanStepRef.current = 'verified';
      const finalScore = res.data.biometric?.confidence?.replace('%', '') || computedScore;
      matchScoreRef.current = finalScore;
      setMatchScore(finalScore);
      const userName = res.data.user?.name ? `${res.data.user.name}` : 'Staff Member';
      setStatusText(`✓ Biometric Verified: Welcome ${userName} (${finalScore}%) · Continuous Monitoring Active`);
      setProgress(100);
      playBiometricChime(false);
    } catch (err) {
      authTriggeredRef.current = false;
      collectedVectorsRef.current = [];

      if (err.response?.data?.requiresEnrollment) {
        setScanStep('needs_enrollment');
        scanStepRef.current = 'needs_enrollment';
        setStatusText(err.response.data.message || 'Face ID not set up yet. Please set up Face ID first.');
      } else if (err.response?.data?.mismatch) {
        setScanStep('error');
        scanStepRef.current = 'error';
        const failScore = err.response.data.matchScore || 70;
        setMatchScore(failScore);
        setStatusText(err.response.data.message || `Biometric Mismatch (${failScore}% match). Face does not match enrolled template.`);
      } else {
        setScanStep('error');
        scanStepRef.current = 'error';
        setStatusText(err.response?.data?.message || 'Biometric authentication failed.');
      }
    }
  }, [selectedStaffEmail, targetEmail]);

  // Real-time live frame detection loop powered by TinyFaceDetector neural net
  const startLiveFrameAnalysis = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    consecutiveFramesRef.current = 0;
    positiveStreakRef.current = 0;
    negativeStreakRef.current = 0;
    smoothedBoxRef.current = null;
    authTriggeredRef.current = false;
    collectedVectorsRef.current = [];
    isProcessingRef.current = false;

    loopRef.current = setInterval(async () => {
      if (isProcessingRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight || video.paused) return;

      isProcessingRef.current = true;
      try {
        const result = await detectFaceAI(video);
        const currentMode = modeRef.current;
        const currentStep = scanStepRef.current;
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // CONTINUOUS CAMERA MODE: If already verified or enrolled, keep camera running and actively track face presence!
        if (currentStep === 'verified' || currentStep === 'enrolled') {
          if (result.detected && result.box) {
            const nx = (result.box.x / vw) * 100;
            const ny = (result.box.y / vh) * 100;
            const nw = (result.box.width / vw) * 100;
            const nh = (result.box.height / vh) * 100;

            if (smoothedBoxRef.current) {
              smoothedBoxRef.current = {
                nx: smoothedBoxRef.current.nx * 0.75 + nx * 0.25,
                ny: smoothedBoxRef.current.ny * 0.75 + ny * 0.25,
                nw: smoothedBoxRef.current.nw * 0.75 + nw * 0.25,
                nh: smoothedBoxRef.current.nh * 0.75 + nh * 0.25,
              };
              setFaceBox({ ...smoothedBoxRef.current });
            }
            if (result.landmarks) {
              setLandmarks(getKeyLandmarks(result.landmarks, vw, vh));
            }
            setFaceDetected(true);
            if (currentStep === 'verified') {
              setStatusText(`✓ Clinical Presence Active · Verified (${matchScoreRef.current}%)`);
            } else {
              setStatusText(`✓ Face ID Enrolled · Biometric Identity Stored in Database`);
            }
          } else {
            setFaceDetected(false);
            setLandmarks([]);
            setStatusText(result.message || '⚠️ Position your face inside the frame');
          }
          return;
        }

        // If in paused or error/needs_enrollment state, wait for user intervention
        if (currentStep === 'needs_enrollment' || (currentStep === 'error' && authTriggeredRef.current)) {
          return;
        }

        // AI Neural Face Detection Result
        if (result.detected && result.box) {
          positiveStreakRef.current += 1;
          negativeStreakRef.current = 0;

          // Normalized percentage coordinates for viewfinder overlay
          const nx = (result.box.x / vw) * 100;
          const ny = (result.box.y / vh) * 100;
          const nw = (result.box.width / vw) * 100;
          const nh = (result.box.height / vh) * 100;

          if (!smoothedBoxRef.current) {
            smoothedBoxRef.current = { nx, ny, nw, nh };
          } else {
            smoothedBoxRef.current = {
              nx: smoothedBoxRef.current.nx * 0.7 + nx * 0.3,
              ny: smoothedBoxRef.current.ny * 0.7 + ny * 0.3,
              nw: smoothedBoxRef.current.nw * 0.7 + nw * 0.3,
              nh: smoothedBoxRef.current.nh * 0.7 + nh * 0.3,
            };
          }
          setFaceBox(smoothedBoxRef.current);

          if (result.landmarks) {
            setLandmarks(getKeyLandmarks(result.landmarks, vw, vh));
          }

          // Require 2 positive frames before locking state
          if (positiveStreakRef.current >= 2) {
            setFaceDetected(true);
            consecutiveFramesRef.current += 1;
            const frames = consecutiveFramesRef.current;

            // Collect 128-D FaceNet biometric descriptor
            if (result.descriptor && result.descriptor.length === 128) {
              collectedVectorsRef.current.push(result.descriptor);
            }

            // === ENROLLMENT MODE (Set Up Face ID) ===
            if (currentMode === 'enroll') {
              if (frames <= 3) {
                setScanStep('scanning');
                setStatusText('Center face in frame · Capturing facial topography (Step 1/3)...');
                setProgress(Math.min(30, frames * 10));
              } else if (frames <= 7) {
                setScanStep('analyzing');
                setStatusText('Mapping 128 deep neural facial landmarks (Step 2/3)...');
                setProgress(Math.min(70, 30 + (frames - 3) * 10));
              } else if (frames <= 10) {
                setStatusText('Synthesizing high-precision biometric template (Step 3/3)...');
                setProgress(Math.min(95, 70 + (frames - 7) * 8));
              } else {
                // 10+ frames collected: average vectors and save to database
                if (collectedVectorsRef.current.length >= 6) {
                  const averaged = averageVectors(collectedVectorsRef.current);
                  performEnrollment(averaged);
                }
              }
            } 
            // === UNLOCK MODE ===
            else {
              if (frames <= 2) {
                setScanStep('scanning');
                setStatusText('Face aligned · AI Neural Net scanning...');
                setProgress(Math.min(35, frames * 17));
              } else if (frames <= 5) {
                setScanStep('analyzing');
                setStatusText('Extracting 128-D FaceNet biometric descriptor...');
                setProgress(Math.min(75, 35 + (frames - 2) * 14));
              } else if (frames <= 7) {
                setStatusText('Comparing facial biometric with hospital database...');
                setProgress(Math.min(95, 75 + (frames - 5) * 10));
              } else {
                // 7+ frames of verified real face: send averaged vector for database matching
                if (collectedVectorsRef.current.length >= 4) {
                  const averaged = averageVectors(collectedVectorsRef.current);
                  const finalScore = result.confidence || 98.4;
                  setMatchScore(finalScore);
                  performAuthentication(finalScore, averaged);
                }
              }
            }
          }
        } else {
          // Frame did not detect face (hand covering camera, non-face object, or low light)
          negativeStreakRef.current += 1;

          if (negativeStreakRef.current <= 2 && positiveStreakRef.current >= 2) {
            // Grace period: ignore brief 1-2 frame blips
            consecutiveFramesRef.current = Math.max(0, consecutiveFramesRef.current - 1);
            setProgress(prev => Math.max(0, prev - 5));
          } else {
            // Sustained loss of face
            positiveStreakRef.current = 0;
            consecutiveFramesRef.current = 0;
            smoothedBoxRef.current = null;
            setFaceDetected(false);
            setFaceBox(null);
            setLandmarks([]);
            setScanStep('searching');
            setStatusText(result.message || '⚠️ Position your face inside the frame');
            setProgress(0);
            collectedVectorsRef.current = [];
          }
        }
      } catch (err) {
        console.error('Frame analysis error:', err);
      } finally {
        isProcessingRef.current = false;
      }
    }, 120);
  }, [performAuthentication, performEnrollment]);

  // Start webcam when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setScanStep('init');
    setStatusText('Requesting optical camera feed...');
    setProgress(0);
    setCameraError('');
    consecutiveFramesRef.current = 0;
    positiveStreakRef.current = 0;
    negativeStreakRef.current = 0;
    smoothedBoxRef.current = null;
    authTriggeredRef.current = false;
    collectedVectorsRef.current = [];

    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam media devices not supported in this browser.');
        }

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          });
        } catch (e1) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        const attachStream = async () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.warn('Video play error:', playErr);
            }
            if (isMounted) {
              setCameraActive(true);
              setScanStep('searching');
              setStatusText(
                modeRef.current === 'enroll'
                  ? 'Face ID Setup Mode · Center face inside frame to enroll'
                  : 'Optical sensor active · Looking for clinical face...'
              );
              startLiveFrameAnalysis();
            }
          }
        };

        attachStream();
        setTimeout(attachStream, 80);

      } catch (err) {
        console.warn('Camera stream error:', err);
        setCameraError(
          'Webcam access unavailable or permission not granted. You can use Biometric Simulation Mode to test.'
        );
        setCameraActive(false);
        setStatusText('Biometric sensor standby · Click Run Scan to test');
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, startLiveFrameAnalysis, stopCamera]);

  // Fallback simulation for testing without webcam
  function handleSimulateScan() {
    setScanStep('scanning');
    setStatusText(mode === 'enroll' ? 'Simulating AI optical sensor acquisition...' : 'Simulating AI optical sensor matching...');
    setProgress(35);

    setTimeout(() => {
      setScanStep('analyzing');
      setStatusText(mode === 'enroll' ? 'Synthesizing 128-D neural template...' : 'Analyzing simulated 128-D facial landmarks...');
      setProgress(70);

      setTimeout(() => {
        const syntheticVector = new Array(128).fill(0).map((_, i) => parseFloat((Math.sin(i * 0.1) * 0.15).toFixed(4)));
        if (mode === 'enroll') {
          performEnrollment(syntheticVector);
        } else {
          const score = (96.0 + Math.random() * 3.4).toFixed(1);
          setMatchScore(score);
          performAuthentication(score, syntheticVector);
        }
      }, 1200);
    }, 1000);
  }

  if (!isOpen) return null;

  // Selected staff metadata
  const currentStaffObj = enrolledStaff.find(s => s.email === selectedStaffEmail);
  const isSelectedStaffEnrolled = Boolean(currentStaffObj?.has_descriptor || currentStaffObj?.face_enrolled);

  // Reticle visual state
  let reticleBorder = 'rgba(59, 130, 246, 0.6)';
  let reticleGlow = '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 15px rgba(59, 130, 246, 0.15)';
  let cornerColor = '#60A5FA';

  if (scanStep === 'verified' || scanStep === 'enrolled') {
    reticleBorder = '#10B981';
    reticleGlow = '0 0 40px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.2)';
    cornerColor = '#10B981';
  } else if (scanStep === 'needs_enrollment') {
    reticleBorder = 'rgba(245, 158, 11, 0.85)';
    reticleGlow = '0 0 30px rgba(245, 158, 11, 0.35), inset 0 0 15px rgba(245, 158, 11, 0.15)';
    cornerColor = '#F59E0B';
  } else if (cameraActive && !faceDetected && scanStep !== 'init') {
    reticleBorder = 'rgba(239, 68, 68, 0.85)';
    reticleGlow = '0 0 30px rgba(239, 68, 68, 0.35), inset 0 0 15px rgba(239, 68, 68, 0.15)';
    cornerColor = '#EF4444';
  } else if (faceDetected) {
    reticleBorder = mode === 'enroll' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(16, 185, 129, 0.9)';
    reticleGlow = mode === 'enroll' ? '0 0 35px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.15)' : '0 0 35px rgba(16, 185, 129, 0.4), inset 0 0 15px rgba(16, 185, 129, 0.15)';
    cornerColor = mode === 'enroll' ? '#3B82F6' : '#10B981';
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="fade-in">
        
        {/* Hidden Canvas for Live Video Processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Top Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              ...styles.faceIdIcon,
              background: (scanStep === 'verified' || scanStep === 'enrolled')
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : mode === 'enroll'
                ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
                : 'linear-gradient(135deg, #1E40AF, #0D9488)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
                <path d="M9 15c1.5 1 4.5 1 6 0" />
                <line x1="12" y1="11" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h3 style={styles.title}>
                {mode === 'enroll' ? 'Set Up Face ID (Enrollment)' : 'Face ID Biometric Unlock'}
              </h3>
              <p style={styles.subtitle}>
                {mode === 'enroll'
                  ? 'SMARTPHONE-STYLE BIOMETRIC PROFILE ENROLLMENT'
                  : 'LIVE OPTICAL CAMERA · MATCHED WITH DATABASE PROFILE'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Cancel">✕</button>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={styles.modeTabs}>
          <button
            type="button"
            onClick={() => handleSwitchMode('unlock')}
            style={{
              ...styles.modeTab,
              ...(mode === 'unlock' ? styles.modeTabActive : {})
            }}
          >
            <span>🔓</span>
            <span>Unlock Workstation</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('enroll')}
            style={{
              ...styles.modeTab,
              ...(mode === 'enroll' ? styles.modeTabActiveEnroll : {})
            }}
          >
            <span>⚙️</span>
            <span>Set Up Face ID</span>
          </button>
        </div>

        {/* Biometric Viewport Area */}
        <div style={styles.scannerWrapper}>
          <div style={{
            ...styles.viewfinder,
            borderColor: reticleBorder,
            boxShadow: reticleGlow,
            borderRadius: mode === 'enroll' ? '50%' : '36px'
          }}>

            {/* Live Camera Video - ALWAYS rendered in DOM */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                ...styles.video,
                display: cameraActive ? 'block' : 'none',
                borderRadius: mode === 'enroll' ? '50%' : '32px'
              }}
            />

            {/* Standby Placeholder */}
            {!cameraActive && (
              <div style={styles.placeholderFace}>
                <div style={{
                  fontSize: '54px',
                  marginBottom: '10px',
                  filter: (scanStep === 'verified' || scanStep === 'enrolled') ? 'drop-shadow(0 0 12px #10B981)' : 'none'
                }}>
                  {scanStep === 'verified' || scanStep === 'enrolled' ? '✅' : mode === 'enroll' ? '📱' : '👤'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', padding: '0 20px' }}>
                  {cameraError ? 'Simulation Mode Ready' : 'Connecting Optical Sensor...'}
                </div>
              </div>
            )}

            {/* 4 Face ID Corner Brackets (displayed in unlock mode) */}
            {mode === 'unlock' && (
              <>
                <div style={{ ...styles.corner, ...styles.topLeft, borderColor: cornerColor }} />
                <div style={{ ...styles.corner, ...styles.topRight, borderColor: cornerColor }} />
                <div style={{ ...styles.corner, ...styles.bottomLeft, borderColor: cornerColor }} />
                <div style={{ ...styles.corner, ...styles.bottomRight, borderColor: cornerColor }} />
              </>
            )}

            {/* Circular Guide Ring (displayed in enrollment mode) */}
            {mode === 'enroll' && (
              <div style={{
                position: 'absolute',
                inset: '8px',
                borderRadius: '50%',
                border: '2px dashed rgba(59, 130, 246, 0.4)',
                pointerEvents: 'none',
                animation: 'spin 12s linear infinite'
              }} />
            )}

            {/* Sweeping Laser Radar Beam */}
            <div
              style={{
                ...styles.laserBeam,
                opacity: (cameraActive && faceDetected && scanStep !== 'verified' && scanStep !== 'enrolled') ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            />

            {/* Dynamic Landmark Points Overlay */}
            <div
              style={{
                ...styles.landmarkOverlay,
                opacity: (cameraActive && faceDetected && scanStep !== 'verified' && scanStep !== 'enrolled') ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              {landmarks && landmarks.length > 0 ? (
                landmarks.map((pt, idx) => (
                  <span
                    key={idx}
                    style={{
                      ...styles.landmarkDot,
                      top: `${pt.top}%`,
                      left: `${pt.left}%`
                    }}
                  />
                ))
              ) : faceBox ? (
                <>
                  <span style={{ ...styles.landmarkDot, top: `${faceBox.ny + faceBox.nh * 0.35}%`, left: `${faceBox.nx + faceBox.nw * 0.35}%` }} />
                  <span style={{ ...styles.landmarkDot, top: `${faceBox.ny + faceBox.nh * 0.35}%`, left: `${faceBox.nx + faceBox.nw * 0.65}%` }} />
                  <span style={{ ...styles.landmarkDot, top: `${faceBox.ny + faceBox.nh * 0.52}%`, left: `${faceBox.nx + faceBox.nw * 0.50}%` }} />
                  <span style={{ ...styles.landmarkDot, top: `${faceBox.ny + faceBox.nh * 0.72}%`, left: `${faceBox.nx + faceBox.nw * 0.50}%` }} />
                </>
              ) : null}
            </div>

            {/* Verified / Enrolled Success Badge */}
            {scanStep === 'verified' && (
              <div style={styles.successBadge}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <span>MATCH {matchScore}%</span>
              </div>
            )}

            {scanStep === 'enrolled' && (
              <div style={styles.successBadge}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <span>ENROLLED IN DB</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Progress Bar */}
        <div style={styles.progressBarWrapper}>
          <div style={{
            ...styles.progressBar,
            width: `${progress}%`,
            background: (scanStep === 'verified' || scanStep === 'enrolled')
              ? 'linear-gradient(90deg, #10B981, #34D399)'
              : mode === 'enroll'
              ? 'linear-gradient(90deg, #2563EB, #8B5CF6, #10B981)'
              : faceDetected
              ? 'linear-gradient(90deg, #2563EB, #10B981)'
              : 'linear-gradient(90deg, #EF4444, #F87171)'
          }} />
        </div>

        {/* Telemetry Status Message */}
        <div style={{ textAlign: 'center', marginBottom: '16px', minHeight: '48px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: (scanStep === 'verified' || scanStep === 'enrolled')
              ? '#34D399'
              : scanStep === 'needs_enrollment'
              ? '#FBBF24'
              : !faceDetected && cameraActive
              ? '#F87171'
              : scanStep === 'error'
              ? '#F87171'
              : '#93C5FD',
            letterSpacing: '0.02em',
            marginBottom: '4px',
            transition: 'color 0.3s ease'
          }}>
            {statusText}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
            {cameraActive
              ? (faceDetected
                  ? (mode === 'enroll' ? 'Face Geometry Locked · Capturing Biometric Points' : 'Face Geometry Locked · Comparing with Database Template')
                  : 'Live Optical Stream · Center Your Face in Frame')
              : 'Biometric Standby · Camera Mode'}
          </div>
        </div>

        {/* Enrollment Status Notice Banner */}
        {mode === 'unlock' && selectedStaffEmail && !isSelectedStaffEnrolled && scanStep !== 'verified' && (
          <div style={styles.noticeBannerWarning}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <div style={{ flex: 1, fontSize: '11px', color: '#FDE68A', lineHeight: '1.4' }}>
                Face ID is not set up yet for <strong>{currentStaffObj?.name || 'this user'}</strong>.
                You must set up your face identity before unlocking.
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSwitchMode('enroll')}
              style={styles.switchModeActionBtn}
            >
              ⚙️ Set Up Face ID Now →
            </button>
          </div>
        )}

        {/* Staff Identity Selector */}
        {enrolledStaff.length > 0 && scanStep !== 'verified' && scanStep !== 'enrolled' && (
          <div style={styles.staffSelector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={styles.staffLabel}>
                {mode === 'enroll' ? 'STAFF ACCOUNT TO ENROLL:' : 'AUTHENTICATE ACCOUNT:'}
              </label>
              {selectedStaffEmail ? (
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: isSelectedStaffEnrolled ? '#34D399' : '#F59E0B',
                  fontWeight: '600'
                }}>
                  {isSelectedStaffEnrolled ? (currentStaffObj?.is_modern_ai ? '✓ AI ENROLLED' : '⚠️ LEGACY (RE-ENROLL)') : '⚠️ NOT SET UP'}
                </span>
              ) : (
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#60A5FA', fontWeight: '600' }}>
                  ✨ AUTO 1:N IDENTIFY
                </span>
              )}
            </div>
            <select
              value={selectedStaffEmail}
              onChange={e => setSelectedStaffEmail(e.target.value)}
              style={styles.staffSelect}
            >
              {mode === 'unlock' && (
                <option value="">✨ Auto-Identify Face (Any Enrolled Clinical Staff)</option>
              )}
              {enrolledStaff.map(s => (
                <option key={s.id} value={s.email}>
                  {s.name} ({s.role.replace('_', ' ').toUpperCase()}) — {s.is_modern_ai ? '✓ AI Face ID' : (s.has_descriptor ? 'Legacy Face ID' : 'Not Set Up')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          
          {/* 1. Verified Success State (Unlock Mode) */}
          {scanStep === 'verified' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  stopCamera();
                  if (verifiedAuthData) onSuccess(verifiedAuthData);
                }}
                style={styles.proceedBtn}
                type="button"
              >
                <span>✓</span>
                <span>Proceed to Workstation Portal</span>
              </button>

              <div style={styles.continuousBadge}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span>CONTINUOUS CAMERA ON · LIVE OPTICAL TELEMETRY</span>
              </div>
            </div>
          )}

          {/* 2. Enrolled Success State (Enrollment Mode) */}
          {scanStep === 'enrolled' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={styles.enrollSuccessBox}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>
                  ✓ Biometric Profile Successfully Enrolled!
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {enrollSuccessMessage || 'Your facial template has been saved to the hospital database. You can now use Face ID to unlock.'}
                </div>
              </div>

              <button
                onClick={() => handleSwitchMode('unlock')}
                style={styles.proceedBtn}
                type="button"
              >
                <span>🔓</span>
                <span>Switch to Unlock Mode & Test</span>
              </button>
            </div>
          )}

          {/* 3. Needs Enrollment Warning Action */}
          {scanStep === 'needs_enrollment' && (
            <button
              onClick={() => handleSwitchMode('enroll')}
              style={styles.enrollNowBtn}
              type="button"
            >
              ⚙️ Set Up Face ID for {currentStaffObj?.name || selectedStaffEmail}
            </button>
          )}

          {/* 4. Standby Simulation Mode */}
          {!cameraActive && scanStep !== 'verified' && scanStep !== 'enrolled' && (
            <button
              onClick={handleSimulateScan}
              style={mode === 'enroll' ? styles.simulateEnrollBtn : styles.simulateBtn}
              type="button"
            >
              {mode === 'enroll' ? '⚡ Simulate Face ID Setup & Enroll in DB' : '⚡ Run Biometric Scan'}
            </button>
          )}

          {/* 5. Retry Button on Error or Mismatch */}
          {cameraActive && (scanStep === 'error' || scanStep === 'needs_enrollment') && (
            <button
              onClick={() => {
                setScanStep('searching');
                scanStepRef.current = 'searching';
                authTriggeredRef.current = false;
                collectedVectorsRef.current = [];
                startLiveFrameAnalysis();
              }}
              style={styles.retryBtn}
              type="button"
            >
              ↺ Retry Face Scan
            </button>
          )}

          {/* 6. Cancel / Close */}
          <button
            onClick={onClose}
            style={styles.cancelBtn}
            type="button"
          >
            {scanStep === 'verified' || scanStep === 'enrolled' ? 'Close Camera' : 'Cancel / Use Password'}
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 10, 25, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '16px'
  },
  modal: {
    background: '#0E172A',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '24px',
    padding: '24px 20px',
    width: '100%',
    maxWidth: '430px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(37, 99, 235, 0.15)',
    color: '#F8FAFC'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  faceIdIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    transition: 'background 0.4s ease',
    flexShrink: 0
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  subtitle: {
    fontSize: '9px',
    color: '#64748B',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.06em',
    marginTop: '2px'
  },
  closeBtn: {
    background: '#131F37',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94A3B8',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modeTabs: {
    display: 'flex',
    background: '#131F37',
    padding: '4px',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  modeTab: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.25s ease'
  },
  modeTabActive: {
    background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
    color: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
  },
  modeTabActiveEnroll: {
    background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
    color: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.4)'
  },
  scannerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    margin: '6px 0 16px'
  },
  viewfinder: {
    width: '230px',
    height: '230px',
    borderRadius: '36px',
    border: '2px solid rgba(59, 130, 246, 0.6)',
    position: 'relative',
    overflow: 'hidden',
    background: '#070C1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease, border-radius 0.4s ease'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)'
  },
  placeholderFace: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  corner: {
    position: 'absolute',
    width: '24px',
    height: '24px',
    borderWidth: '3px',
    borderStyle: 'solid',
    zIndex: 5,
    transition: 'border-color 0.4s ease'
  },
  topLeft: {
    top: '12px',
    left: '12px',
    borderRight: 'none',
    borderBottom: 'none',
    borderTopLeftRadius: '10px'
  },
  topRight: {
    top: '12px',
    right: '12px',
    borderLeft: 'none',
    borderBottom: 'none',
    borderTopRightRadius: '10px'
  },
  bottomLeft: {
    bottom: '12px',
    left: '12px',
    borderRight: 'none',
    borderTop: 'none',
    borderBottomLeftRadius: '10px'
  },
  bottomRight: {
    bottom: '12px',
    right: '12px',
    borderLeft: 'none',
    borderTop: 'none',
    borderBottomRightRadius: '10px'
  },
  laserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)',
    boxShadow: '0 0 15px #10B981, 0 0 8px #34D399',
    zIndex: 6,
    animation: 'faceScanRadar 2s ease-in-out infinite'
  },
  landmarkOverlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 7,
    transform: 'scaleX(-1)'
  },
  landmarkDot: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#34D399',
    boxShadow: '0 0 8px #10B981',
    animation: 'landmarkPulse 1.2s ease-in-out infinite',
    transition: 'top 0.15s ease-out, left 0.15s ease-out'
  },
  successBadge: {
    position: 'absolute',
    bottom: '14px',
    background: 'rgba(16, 185, 129, 0.9)',
    color: '#FFFFFF',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    zIndex: 10,
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
  },
  progressBarWrapper: {
    width: '100%',
    height: '4px',
    background: '#1E293B',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  progressBar: {
    height: '100%',
    transition: 'all 0.25s ease'
  },
  noticeBannerWarning: {
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    borderRadius: '10px',
    padding: '10px 12px',
    marginBottom: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  switchModeActionBtn: {
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 12px',
    color: '#000000',
    fontWeight: '700',
    fontSize: '11px',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  staffSelector: {
    background: '#131F37',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    marginBottom: '14px'
  },
  staffLabel: {
    display: 'block',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: '#94A3B8',
    letterSpacing: '0.06em'
  },
  staffSelect: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#F8FAFC',
    fontSize: '12px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  simulateBtn: {
    width: '100%',
    padding: '11px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.03em',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
  },
  simulateEnrollBtn: {
    width: '100%',
    padding: '11px',
    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.03em',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
  },
  retryBtn: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  enrollNowBtn: {
    width: '100%',
    padding: '11px',
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    border: 'none',
    borderRadius: '10px',
    color: '#000000',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
  },
  cancelBtn: {
    width: '100%',
    padding: '9px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#94A3B8',
    fontSize: '12px',
    cursor: 'pointer'
  },
  proceedBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  enrollSuccessBox: {
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '10px',
    padding: '12px',
    textAlign: 'center'
  },
  continuousBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '7px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '8px',
    fontSize: '10px',
    color: '#34D399',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)'
  }
};
