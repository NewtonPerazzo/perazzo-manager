"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";

import { Button } from "@/components/atoms/button";
import { ImageDisplay } from "@/components/atoms/image-display";

interface ImagePickerProps {
  value?: string | null;
  alt: string;
  onChange: (value: string) => void;
  selectLabel: string;
  changeLabel: string;
  removeLabel: string;
}

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export function ImagePicker({
  value,
  alt,
  onChange,
  selectLabel,
  changeLabel,
  removeLabel
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_SIZE_BYTES) {
      event.target.value = "";
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  }

  function handleRemove() {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-surface-700 p-3">
      <ImageDisplay
        src={value}
        alt={alt}
        width={96}
        height={96}
        className="h-20 w-20 min-h-20 min-w-20 shrink-0 rounded-full border border-surface-700 object-cover"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
          {value ? changeLabel : selectLabel}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" onClick={handleRemove}>
            {removeLabel}
          </Button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
