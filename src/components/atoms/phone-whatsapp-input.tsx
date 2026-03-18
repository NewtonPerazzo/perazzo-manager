"use client";

import { PhoneInput } from "@/components/atoms/phone-input";

interface PhoneWhatsappInputProps {
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PhoneWhatsappInput(props: PhoneWhatsappInputProps) {
  return <PhoneInput {...props} />;
}
