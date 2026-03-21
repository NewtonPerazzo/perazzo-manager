export function normalizePhone(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

export function hasValidWhatsapp(value?: string | null): boolean {
  return normalizePhone(value).length >= 8;
}

