"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface IdCaptureProps {
  onCapture: (file: File) => void;
  currentImage?: string | null;
}

type CaptureMode = "camera" | "upload" | "idle";

export default function IdCapture({
  onCapture,
  currentImage,
}: IdCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<CaptureMode>("idle");
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check camera availability on mount
  useEffect(() => {
    setCameraSupported(
      typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  // Handle camera stream
  useEffect(() => {
    if (mode !== "camera") return;

    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Back camera for ID
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error("ID camera error", e);
        setError("לא ניתן לפתוח את המצלמה. בחר תמונה בעלייה.");
        setMode("idle");
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode]);

  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) return;

    const file = new File([blob], "id.jpg", { type: blob.type });
    const url = URL.createObjectURL(blob);
    setPreview(url);
    setMode("idle");
    onCapture(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setMode("idle");
        onCapture(file);
      };
      reader.readAsDataURL(file);
    } else {
      setError("אנא בחר תמונה תקינה.");
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setError(null);
    setMode("idle");
  };

  const handleStartCamera = () => {
    setError(null);
    setMode("camera");
  };

  const handleStartUpload = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  // Show preview if image is captured
  if (preview) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">צילום תעודת זהות</h3>
          <p className="text-sm text-gray-600">
            תעודה נבחרה בהצלחה
          </p>
        </div>

        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
          <Image
            src={preview}
            alt="ID Document"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleRetake}
          >
            בחר שוב
          </Button>
        </div>
      </div>
    );
  }

  // Show camera view if in camera mode
  if (mode === "camera") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">צילום תעודת זהות</h3>
          <p className="text-sm text-gray-600">
            צלם תמונה ברורה של תעודת הזהות או הדרכון שלך
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleRetake}
          >
            בטל
          </Button>
          <Button
            type="button"
            onClick={handleCaptureFrame}
            className="flex-1"
            size="lg"
          >
            צלם תעודה
          </Button>
        </div>
      </div>
    );
  }

  // Show option selection
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">צילום תעודת זהות</h3>
        <p className="text-sm text-gray-600">
          בחר: צלם עכשיו או העלה תמונה קיימת
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3">
        {cameraSupported && (
          <button
            type="button"
            onClick={handleStartCamera}
            className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm font-medium text-blue-900">צלם עכשיו</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleStartUpload}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl">📁</span>
          <span className="text-sm font-medium text-gray-900">העלה תמונה</span>
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        ודא שתעודת הזהות או הדרכון שלך בתמונה ברורה ומוארה
      </p>
    </div>
  );
}
