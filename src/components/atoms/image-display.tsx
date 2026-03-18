import Image from "next/image";

import { PhotoPlaceholder } from "@/components/atoms/photo-placeholder";

interface ImageDisplayProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ImageDisplay({
  src,
  alt,
  className,
  width = 80,
  height = 80
}: ImageDisplayProps) {
  if (!src) {
    return <PhotoPlaceholder className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
    />
  );
}
