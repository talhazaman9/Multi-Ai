import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Activity, AlertCircle } from 'lucide-react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

export const LiveCameraPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time gesture states
  const [handState, setHandState] = useState<'OPEN' | 'CLOSED' | 'NONE'>('NONE');
  const [eyeState, setEyeState] = useState<'OPEN' | 'CLOSED' | 'NONE'>('NONE');
  const [mouthState, setMouthState] = useState<'OPEN' | 'CLOSED' | 'NONE'>('NONE');

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize MediaPipe Models
  useEffect(() => {
    let active = true;

    async function initMediaPipe() {
      setModelLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        if (!active) return;

        const handLM = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        const faceLM = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        handLandmarkerRef.current = handLM;
        faceLandmarkerRef.current = faceLM;
        setModelLoading(false);
      } catch (err: any) {
        console.error('MediaPipe Init Error:', err);
        setError(`Failed to load vision models: ${err.message}`);
        setModelLoading(false);
      }
    }

    initMediaPipe();

    return () => {
      active = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraOn(true);
          renderLoop();
        };
      }
    } catch (err: any) {
      setError(`Camera Access Error: ${err.message || 'Unable to access webcam.'}`);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setHandState('NONE');
    setEyeState('NONE');
    setMouthState('NONE');
  };

  const renderLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.paused || video.ended) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nowMs = performance.now();

    // 1. Hand Detection & Landmark Drawing
    if (handLandmarkerRef.current) {
      try {
        const handResults = handLandmarkerRef.current.detectForVideo(video, nowMs);
        if (handResults.landmarks && handResults.landmarks.length > 0) {
          const landmarks = handResults.landmarks[0];
          
          // Draw Hand Mesh Lines
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 2;
          landmarks.forEach((lm) => {
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#00f3ff';
            ctx.fill();
          });

          // Calculate Hand Open vs Closed based on distance between Wrist (0) & Fingertips (8, 12, 16, 20)
          const wrist = landmarks[0];
          const indexTip = landmarks[8];
          const middleTip = landmarks[12];
          const distIndex = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
          const distMiddle = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);

          if (distIndex > 0.35 || distMiddle > 0.35) {
            setHandState('OPEN');
          } else {
            setHandState('CLOSED');
          }
        } else {
          setHandState('NONE');
        }
      } catch (e) {
        // monatonic timestamp warning safe catch
      }
    }

    // 2. Face Landmark Detection (Eyes & Mouth Openness)
    if (faceLandmarkerRef.current) {
      try {
        const faceResults = faceLandmarkerRef.current.detectForVideo(video, nowMs);
        if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
          const faceLM = faceResults.faceLandmarks[0];

          // Upper & Lower Lip landmarks (MediaPipe Face Mesh: 13 top, 14 bottom)
          const upperLip = faceLM[13];
          const lowerLip = faceLM[14];
          const mouthDist = Math.hypot(upperLip.x - lowerLip.x, upperLip.y - lowerLip.y);

          if (mouthDist > 0.04) {
            setMouthState('OPEN');
          } else {
            setMouthState('CLOSED');
          }

          // Eye Landmarks (Left Eye: 159 top, 145 bottom)
          const eyeTop = faceLM[159];
          const eyeBottom = faceLM[145];
          const eyeDist = Math.hypot(eyeTop.x - eyeBottom.x, eyeTop.y - eyeBottom.y);

          if (eyeDist > 0.018) {
            setEyeState('OPEN');
          } else {
            setEyeState('CLOSED');
          }

          // Draw subtle Face Bounding Box
          ctx.strokeStyle = '#9d4edd';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(faceLM[1].x * canvas.width, faceLM[1].y * canvas.height, 60, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          setEyeState('NONE');
          setMouthState('NONE');
        }
      } catch (e) {
        // ignore
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Live 60FPS Computer Vision</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time in-browser facial and hand landmark tracking using MediaPipe Tasks Web Assembly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {modelLoading ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-xs text-cyan-300 font-semibold border border-slate-700">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading MediaPipe Models...</span>
            </div>
          ) : isCameraOn ? (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold transition"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 text-xs font-bold transition"
            >
              <Camera className="w-4 h-4" />
              <span>Start Webcam Feed</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Video + Live Detection Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Canvas Container */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 overflow-hidden relative min-h-[420px] flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
          />

          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 backdrop-blur-md">
              <Camera className="w-12 h-12 text-cyan-400 mb-3 animate-pulse" />
              <h4 className="text-base font-bold text-slate-200">Camera Offline</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Click "Start Webcam Feed" above to trigger real-time MediaPipe hand, eye, and mouth landmark tracking.
              </p>
            </div>
          )}
        </div>

        {/* Real-time Status Indicators */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Detection Telemetry</span>
            </h4>

            <div className="space-y-4">
              {/* Hand Detection Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✋</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Hand Gesture</span>
                    <span className="text-[10px] text-slate-500">Open / Closed Hand Detection</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${
                    handState === 'OPEN'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : handState === 'CLOSED'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {handState}
                </div>
              </div>

              {/* Eyes Open / Closed */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👁️</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Eye Status</span>
                    <span className="text-[10px] text-slate-500">Open / Closed Eye Detection</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${
                    eyeState === 'OPEN'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : eyeState === 'CLOSED'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {eyeState}
                </div>
              </div>

              {/* Mouth Open / Closed */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👄</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Mouth Status</span>
                    <span className="text-[10px] text-slate-500">Open / Closed Mouth Detection</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${
                    mouthState === 'OPEN'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : mouthState === 'CLOSED'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {mouthState}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 leading-relaxed">
            🚀 All detection is computed 100% locally in your browser using GPU delegates for zero-latency privacy.
          </div>
        </div>
      </div>
    </div>
  );
};
