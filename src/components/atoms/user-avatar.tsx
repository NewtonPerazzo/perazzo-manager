"use client";

import { User } from "lucide-react";

import { cn } from "@/lib/cn";

interface UserAvatarProps {
  name?: string | null;
  photo?: string | null;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10"
};

const iconSizes = {
  sm: 16,
  md: 20
};

export function UserAvatar({ name, photo, size = "md", className }: UserAvatarProps) {
  const label = name ? `${name} profile photo` : "User profile photo";

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-surface-700 bg-surface-800 text-slate-300",
        sizeClasses[size],
        className
      )}
    >
      {photo ? (
        <img src={photo} alt={label} className="h-full w-full object-cover" />
      ) : (
        <User size={iconSizes[size]} aria-hidden="true" />
      )}
    </span>
  );
}
