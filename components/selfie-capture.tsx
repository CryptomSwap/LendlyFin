"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  currentImage?: string | null;
}

type CaptureMode = "camera" | "upload" | "idle";

export default function SelfieCapture({
  onCapture,
  currentImage,
}: SelfieCaptureProps) {
  const isCameraSupported =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<CaptureMode>("idle");
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [cameraSupported] = useState<boolean>(isCameraSupported);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "camera") return;

    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
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
        console.error("Selfie camera error", e);
        setError(
          "לא ניתן לפתוח את המצלמה. נסה להעלות תמונה במקום."
        );
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

    const file = new File([blob], "selfie.jpg", { type: blob.type });
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

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">צילום סלפי</h3>
          <p className="text-sm text-muted-foreground">
            תמונה נבחרה בהצלחה
          </p>
        </div>

        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted">
          <Image
            src={preview}
            alt="Selfie"
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
            צלם שוב
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "camera") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">צילום סלפי</h3>
          <p className="text-sm text-muted-foreground">
            נצלם עכשיו תמונה ברורה של הפנים שלך מתוך המצלמה.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-black flex items-center justify-center">
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
            צלם סלפי
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">צילום סלפי</h3>
        <p className="text-sm text-muted-foreground">
          בחר: צלם עכשיו במצלמה או העלה תמונה קיימת
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
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
            className="p-4 border-2 border-dashed border-[var(--mint-accent)]/40 rounded-lg bg-[var(--mint-accent)]/10 hover:bg-[var(--mint-accent)]/15 transition flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl" aria-hidden>📸</span>
            <span className="text-sm font-medium text-foreground">צלם עכשיו</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleStartUpload}
          className="p-4 border-2 border-dashed border-border rounded-lg bg-card hover:bg-muted/40 transition flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl" aria-hidden>📁</span>
          <span className="text-sm font-medium text-foreground">העלה תמונה</span>
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        ודא שהפנים שלך בתמונה ברורים ומוארים היטב
      </p>
    </div>
  );
}
