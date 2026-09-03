import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  label?: string;
}

export default function CameraCapture({ onCapture, label = "Capture Verification Photo" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUploadFallback, setShowUploadFallback] = useState(false);

  // Automatically attach the media stream to the <video> element whenever stream state changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.warn("Video autoplay prevented:", err);
      });
    }
  }, [stream]);

  // Clean up media tracks when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setLoading(true);
    setIsConfirmed(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      setStream(mediaStream);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. You can allow camera access or use the upload fallback below.");
      setShowUploadFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsConfirmed(false);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `live_customer_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file);
          setIsConfirmed(true);
        })
        .catch(err => {
          console.error("Error converting captured image:", err);
          setError("Failed to process captured photo.");
        });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
      stopCamera();
      onCapture(file);
      setIsConfirmed(true);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-800">{label}</h4>
        {isConfirmed && (
          <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirmed</span>
          </span>
        )}
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-4 flex items-start space-x-2 text-left">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Video Viewport / Preview Box */}
      <div className="relative w-full max-w-sm mx-auto aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center mb-4 border border-slate-700">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
        ) : stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-400 text-sm flex flex-col items-center p-4">
            <Camera className="h-10 w-10 mb-2 opacity-50 text-slate-300" />
            <span className="font-medium">Camera preview inactive</span>
            <span className="text-xs text-slate-500 mt-1">Click "Start Camera" or upload a file</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!stream && !capturedImage && (
          <>
            <button
              type="button"
              onClick={startCamera}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm"
            >
              <Camera className="h-4 w-4" />
              <span>{loading ? "Starting Camera..." : "Start Camera"}</span>
            </button>
            <label className="flex items-center space-x-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer bg-white">
              <Upload className="h-4 w-4 text-slate-500" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </>
        )}

        {stream && !capturedImage && (
          <button
            type="button"
            onClick={capturePhoto}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md"
          >
            <Camera className="h-4 w-4" />
            <span>Snap Photo Now</span>
          </button>
        )}

        {capturedImage && (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center space-x-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 bg-white px-4 py-2 rounded-xl font-bold text-xs transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Retake</span>
            </button>
            {!isConfirmed ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Confirm & Use Photo</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 text-emerald-600 font-bold text-xs px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <Check className="h-4 w-4" />
                <span>Photo Confirmed</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
