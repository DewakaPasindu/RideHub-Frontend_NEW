import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  label?: string;
}

export default function CameraCapture({ onCapture, label = "Capture Verification Photo" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure camera permissions are allowed.");
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Convert dataUrl to File object
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "live_customer_photo.jpg", { type: "image/jpeg" });
          onCapture(file);
        });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
      <h4 className="text-sm font-bold text-slate-700 mb-3">{label}</h4>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 flex items-center justify-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative w-full max-w-sm mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center mb-4">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
        ) : stream ? (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-500 text-sm flex flex-col items-center">
            <Camera className="h-10 w-10 mb-2 opacity-40 text-white" />
            <span className="text-slate-400">Camera preview not active</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center space-x-3">
        {!stream && !capturedImage && (
          <button
            type="button"
            onClick={startCamera}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span>{loading ? "Starting..." : "Start Camera"}</span>
          </button>
        )}

        {stream && !capturedImage && (
          <button
            type="button"
            onClick={capturePhoto}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span>Capture Photo</span>
          </button>
        )}

        {capturedImage && (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center space-x-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 bg-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retake</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Confirm & Use Photo</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
