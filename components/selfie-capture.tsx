"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import CameraCapture from "@/components/camera-capture";

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  currentImage?: string | null;
}

export default function SelfieCapture({
  onCapture,
  currentImage,
}: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Try to open front camera with getUserMedia
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      return;
    }

    let cancelled = false;

    const start = async () => {
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
        setCameraSupported(true);
      } catch (e) {
        console.error("Selfie camera error", e);
        setError(
          "לא ניתן לפתוח את המצלמה בדפדפן זה. נשתמש בהעלאת תמונה במקום."
        );
        setCameraSupported(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
    onCapture(file);
  };

  const handleRetake = () => {
    setPreview(null);
    setError(null);
  };

  // If camera is not supported or failed, fall back to file-based capture
  if (cameraSupported === false) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-900">
            {error}
          </div>
        )}
        <CameraCapture
          type="selfie"
          onCapture={onCapture}
          label="צילום סלפי"
          instructions="צלם או העלה תמונה ברורה של הפנים שלך"
          currentImage={currentImage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">צילום סלפי</h3>
        <p className="text-sm text-gray-600">
          נצלם עכשיו תמונה ברורה של הפנים שלך מתוך המצלמה.
        </p>
      </div>

      {preview ? (
        <div className="space-y-4">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
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
      ) : (
        <div className="space-y-4">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted
            />
          </div>
          <Button
            type="button"
            onClick={handleCaptureFrame}
            className="w-full"
            size="lg"
          >
            צלם סלפי
          </Button>
        </div>
      )}
    </div>
  );
}

