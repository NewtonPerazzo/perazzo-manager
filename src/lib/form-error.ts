import type { Locale } from "@/i18n/types";

const messages: Record<Locale, Record<string, string>> = {
  "pt-br": {
    "form.email": "Informe um e-mail válido.",
    "password.loginMin": "Informe sua senha.",
    "password.min": "A senha deve ter pelo menos 8 caracteres.",
    "password.uppercase": "A senha deve conter ao menos uma letra maiúscula.",
    "password.number": "A senha deve conter ao menos um número.",
    "password.special": "A senha deve conter ao menos um caractere especial.",
    "String must contain at least 8 character(s)": "A senha deve ter pelo menos 8 caracteres.",
    "String must contain at least 6 character(s)": "Informe sua senha.",
    "Invalid email": "Informe um e-mail válido.",
    "Invalid input": "Confira os requisitos da senha."
  },
  en: {
    "form.email": "Enter a valid email address.",
    "password.loginMin": "Enter your password.",
    "password.min": "Password must have at least 8 characters.",
    "password.uppercase": "Password must contain at least one uppercase letter.",
    "password.number": "Password must contain at least one number.",
    "password.special": "Password must contain at least one special character.",
    "String must contain at least 8 character(s)": "Password must have at least 8 characters.",
    "String must contain at least 6 character(s)": "Enter your password.",
    "Invalid email": "Enter a valid email address.",
    "Invalid input": "Review the password requirements."
  },
  es: {
    "form.email": "Ingresa un correo válido.",
    "password.loginMin": "Ingresa tu contraseña.",
    "password.min": "La contraseña debe tener al menos 8 caracteres.",
    "password.uppercase": "La contraseña debe tener al menos una letra mayúscula.",
    "password.number": "La contraseña debe tener al menos un número.",
    "password.special": "La contraseña debe tener al menos un carácter especial.",
    "String must contain at least 8 character(s)": "La contraseña debe tener al menos 8 caracteres.",
    "String must contain at least 6 character(s)": "Ingresa tu contraseña.",
    "Invalid email": "Ingresa un correo válido.",
    "Invalid input": "Revisa los requisitos de la contraseña."
  }
};

export function translateFormError(locale: Locale, message: string | undefined, fallback: string) {
  if (!message) return fallback;
  return messages[locale]?.[message] ?? message;
}
