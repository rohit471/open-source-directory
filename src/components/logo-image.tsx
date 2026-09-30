"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";

interface LogoImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizeClassName?: string;
  fallbackText?: string;
}

export function LogoImage({
  src,
  alt,
  className = "",
  sizeClassName = "w-10 h-10 text-base",
  fallbackText,
}: LogoImageProps) {
  const [hasError, setHasError] = useState(false);

  const initial = fallbackText || alt.charAt(0).toUpperCase() || "O";

  if (!src || hasError) {
    return (
      <div
        className={`rounded-xl border border-[#DCE4DD] bg-[#EAF4EC] text-[#166534] flex items-center justify-center font-bold shrink-0 shadow-2xs select-none ${sizeClassName} ${className}`}
        aria-label={`${alt} logo`}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-[#DCE4DD] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative ${sizeClassName} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain p-1.5"
      />
    </div>
  );
}
