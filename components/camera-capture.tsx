"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  type: "selfie" | "id";
  currentImage?: string | null;
  label: string;
  instructions: string;
}

export default function CameraCapture({
  onCapture,
  type,
  currentImage,
  label,
  instructions,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onCapture(file);
    }
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Use "user" for front camera (selfie), "environment" for back camera (ID)
  const captureMode = type === "selfie" ? "user" : "environment";

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-gray-600">{instructions}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={captureMode}
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-4">
          <div
            className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 cursor-pointer"
            onClick={handleCaptureClick}
            role="button"
            aria-label={type === "selfie" ? "החלף תמונת סלפי" : "החלף תמונת תעודה"}
            tabIndex={0}
          >
            <Image
              src={preview}
              alt={label}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRetake}
              className="flex-1"
            >
              צלם שוב
            </Button>
            <Button
              type="button"
              onClick={handleCaptureClick}
              variant="outline"
              className="flex-1"
            >
              החלף תמונה
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer"
            onClick={handleCaptureClick}
            role="button"
            aria-label={type === "selfie" ? "צלם סלפי" : "צלם תעודת זהות"}
            tabIndex={0}
          >
            <div className="text-center space-y-2 p-4">
              <div className="text-4xl">📷</div>
              <p className="text-sm text-gray-600">לחץ כדי לצלם</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleCaptureClick}
            className="w-full"
            size="lg"
          >
            {type === "selfie" ? "צלם סלפי" : "צלם תעודת זהות"}
          </Button>
        </div>
      )}
    </div>
  );
}
