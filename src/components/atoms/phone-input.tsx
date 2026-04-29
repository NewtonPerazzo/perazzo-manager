"use client";

import { cn } from "@/lib/cn";

type CountryOption = {
  code: string;
  flag: string;
  dialCode: string;
  maxDigits: number;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "BR", flag: "🇧🇷", dialCode: "55", maxDigits: 11 },
  { code: "US", flag: "🇺🇸", dialCode: "1", maxDigits: 10 },
  { code: "AR", flag: "🇦🇷", dialCode: "54", maxDigits: 10 },
  { code: "PT", flag: "🇵🇹", dialCode: "351", maxDigits: 9 },
  { code: "ES", flag: "🇪🇸", dialCode: "34", maxDigits: 9 }
];

function formatLocalNumber(country: CountryOption, localDigits: string): string {
  if (!localDigits) return "";

  if (country.code === "BR") {
    const ddd = localDigits.slice(0, 2);
    const first = localDigits.length > 10 ? localDigits.slice(2, 7) : localDigits.slice(2, 6);
    const second = localDigits.length > 10 ? localDigits.slice(7, 11) : localDigits.slice(6, 10);

    if (localDigits.length <= 2) return `(${ddd}`;
    if (!second) return `(${ddd}) ${first}`;
    return `(${ddd}) ${first}-${second}`;
  }

  if (country.code === "US") {
    const a = localDigits.slice(0, 3);
    const b = localDigits.slice(3, 6);
    const c = localDigits.slice(6, 10);

    if (localDigits.length <= 3) return `(${a}`;
    if (!c) return `(${a}) ${b}`;
    return `(${a}) ${b}-${c}`;
  }

  if (localDigits.length <= 5) return localDigits;
  return `${localDigits.slice(0, 5)}-${localDigits.slice(5)}`;
}

function parsePhoneValue(value: string): { country: CountryOption; localDigits: string } {
  const digits = (value ?? "").replace(/\D/g, "");

  for (const option of COUNTRY_OPTIONS) {
    if (digits.startsWith(option.dialCode)) {
      return {
        country: option,
        localDigits: digits.slice(option.dialCode.length, option.dialCode.length + option.maxDigits)
      };
    }
  }

  return {
    country: COUNTRY_OPTIONS[0],
    localDigits: digits.slice(0, COUNTRY_OPTIONS[0].maxDigits)
  };
}

function buildPhoneValue(country: CountryOption, localDigits: string): string {
  if (!localDigits) return "";
  const masked = formatLocalNumber(country, localDigits);
  return `+${country.dialCode} ${masked}`.trim();
}

interface PhoneInputProps {
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PhoneInput({
  value = "",
  onChange,
  className,
  disabled,
  placeholder
}: PhoneInputProps) {
  const parsed = parsePhoneValue(value ?? "");
  const country = parsed.country;
  const localDigits = parsed.localDigits;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        value={country.code}
        disabled={disabled}
        onChange={(event) => {
          const next = COUNTRY_OPTIONS.find((option) => option.code === event.target.value) ?? COUNTRY_OPTIONS[0];
          const nextLocalDigits = localDigits.slice(0, next.maxDigits);
          onChange(buildPhoneValue(next, nextLocalDigits));
        }}
        className="w-[112px] rounded-xl border border-surface-700 bg-surface-900 px-2 py-2 text-base text-white outline-none focus:border-accent-500 md:text-sm"
      >
        {COUNTRY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {`${option.flag} +${option.dialCode}`}
          </option>
        ))}
      </select>

      <input
        type="tel"
        inputMode="tel"
        value={formatLocalNumber(country, localDigits)}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => {
          const nextDigits = event.target.value.replace(/\D/g, "").slice(0, country.maxDigits);
          onChange(buildPhoneValue(country, nextDigits));
        }}
        className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-base text-white outline-none placeholder:text-slate-400 focus:border-accent-500 md:text-sm"
      />
    </div>
  );
}
