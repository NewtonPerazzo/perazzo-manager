import { defaultLocale, normalizeLocale } from "@/i18n";
import type { Locale } from "@/i18n/types";

interface ApiValidationItem {
  loc?: Array<string | number>;
  msg?: string;
}

type TranslationBundle = {
  genericError: string;
  validationError: string;
  fieldFallback: string;
  fields: Record<string, string>;
  detail: Array<{ test: RegExp; text: string }>;
};

const bundles: Record<Locale, TranslationBundle> = {
  "pt-br": {
    genericError: "Ocorreu um erro inesperado. Tente novamente.",
    validationError: "Confira os campos e tente novamente.",
    fieldFallback: "Campo",
    fields: {
      password: "Senha",
      birth_date: "Data de nascimento",
      email: "E-mail",
      name: "Nome",
      last_name: "Sobrenome",
      phone: "Telefone",
      whatsapp: "WhatsApp",
      address: "Rua e número",
      neighborhood: "Bairro",
      payment_method_id: "Forma de pagamento",
      delivery_method_id: "Forma de entrega",
      products: "Produtos",
      amount: "Quantidade",
      color: "Cor",
      stock: "Estoque",
      category_ids: "Categorias"
    },
    detail: [
      { test: /^Store is currently closed$/i, text: "A loja está fechada no momento." },
      { test: /^Delivery method is required when delivery is selected$/i, text: "Selecione o bairro para entrega." },
      { test: /^Delivery method not found$/i, text: "Forma de entrega não encontrada." },
      { test: /^Payment method not found$/i, text: "Forma de pagamento não encontrada." },
      { test: /^Insufficient stock for product:/i, text: "Estoque insuficiente para este produto." },
      { test: /^Product not found:/i, text: "Produto não encontrado." },
      {
        test: /^Customer cannot be deleted because it is linked to existing orders$/i,
        text: "Não foi possível excluir: cliente vinculado a pedidos."
      },
      {
        test: /^Product cannot be deleted because it is linked to existing orders$/i,
        text: "Não foi possível excluir: produto vinculado a pedidos."
      }
    ]
  },
  en: {
    genericError: "Something went wrong. Please try again.",
    validationError: "Please review the fields and try again.",
    fieldFallback: "Field",
    fields: {
      password: "Password",
      birth_date: "Birth date",
      email: "Email",
      name: "Name",
      last_name: "Last name",
      phone: "Phone",
      whatsapp: "WhatsApp",
      address: "Street and number",
      neighborhood: "Neighborhood",
      payment_method_id: "Payment method",
      delivery_method_id: "Delivery method",
      products: "Products",
      amount: "Quantity",
      color: "Color",
      stock: "Stock",
      category_ids: "Categories"
    },
    detail: [
      { test: /^Store is currently closed$/i, text: "The store is currently closed." },
      { test: /^Delivery method is required when delivery is selected$/i, text: "Choose a delivery neighborhood." },
      { test: /^Delivery method not found$/i, text: "Delivery method not found." },
      { test: /^Payment method not found$/i, text: "Payment method not found." },
      { test: /^Insufficient stock for product:/i, text: "Insufficient stock for this product." },
      { test: /^Product not found:/i, text: "Product not found." },
      {
        test: /^Customer cannot be deleted because it is linked to existing orders$/i,
        text: "Cannot delete: customer is linked to existing orders."
      },
      {
        test: /^Product cannot be deleted because it is linked to existing orders$/i,
        text: "Cannot delete: product is linked to existing orders."
      }
    ]
  },
  es: {
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    validationError: "Revisa los campos e inténtalo de nuevo.",
    fieldFallback: "Campo",
    fields: {
      password: "Contraseña",
      birth_date: "Fecha de nacimiento",
      email: "Correo",
      name: "Nombre",
      last_name: "Apellido",
      phone: "Teléfono",
      whatsapp: "WhatsApp",
      address: "Calle y número",
      neighborhood: "Barrio",
      payment_method_id: "Forma de pago",
      delivery_method_id: "Forma de entrega",
      products: "Productos",
      amount: "Cantidad",
      color: "Color",
      stock: "Stock",
      category_ids: "Categorías"
    },
    detail: [
      { test: /^Store is currently closed$/i, text: "La tienda está cerrada en este momento." },
      { test: /^Delivery method is required when delivery is selected$/i, text: "Selecciona el barrio para la entrega." },
      { test: /^Delivery method not found$/i, text: "Forma de entrega no encontrada." },
      { test: /^Payment method not found$/i, text: "Forma de pago no encontrada." },
      { test: /^Insufficient stock for product:/i, text: "Stock insuficiente para este producto." },
      { test: /^Product not found:/i, text: "Producto no encontrado." },
      {
        test: /^Customer cannot be deleted because it is linked to existing orders$/i,
        text: "No se puede eliminar: cliente vinculado a pedidos."
      },
      {
        test: /^Product cannot be deleted because it is linked to existing orders$/i,
        text: "No se puede eliminar: producto vinculado a pedidos."
      }
    ]
  }
};

function getLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = window.localStorage.getItem("pm-locale");
  return normalizeLocale(stored || window.navigator.language);
}

function translateValidationMessage(locale: Locale, raw: string): string {
  const msg = raw.trim();
  if (!msg) return bundles[locale].validationError;

  if (/field required/i.test(msg)) return locale === "en" ? "This field is required." : locale === "es" ? "Este campo es obligatorio." : "Este campo é obrigatório.";
  if (/valid date|datetime/i.test(msg)) return locale === "en" ? "Enter a valid date." : locale === "es" ? "Ingresa una fecha válida." : "Informe uma data válida.";
  if (/valid email address/i.test(msg)) return locale === "en" ? "Enter a valid email address." : locale === "es" ? "Ingresa un correo válido." : "Informe um e-mail válido.";
  if (/too short/i.test(msg)) return locale === "en" ? "Value is too short." : locale === "es" ? "El valor es muy corto." : "O valor está muito curto.";
  if (/uppercase/i.test(msg)) {
    return locale === "en"
      ? "Password must contain at least one uppercase letter."
      : locale === "es"
        ? "La contraseña debe tener al menos una letra mayúscula."
        : "A senha deve conter ao menos uma letra maiúscula.";
  }

  return msg;
}

export function translateDetail(detail: string): string {
  const locale = getLocale();
  const bundle = bundles[locale];
  const stockMatch = detail.match(/^Insufficient stock:\s*only\s*(\d+)\s*units$/i);
  if (stockMatch) {
    const units = stockMatch[1];
    if (locale === "en") return `Insufficient stock: only ${units} units.`;
    if (locale === "es") return `Stock insuficiente: solo ${units} unidades.`;
    return `Estoque insuficiente: apenas ${units} unidades.`;
  }
  const matched = bundle.detail.find((item) => item.test.test(detail));
  return matched?.text ?? detail;
}

export function translateValidationArray(detail: ApiValidationItem[]): string {
  const locale = getLocale();
  const bundle = bundles[locale];

  const lines = detail.map((item) => {
    const fieldKey =
      item.loc && item.loc.length > 1 ? String(item.loc[item.loc.length - 1]) : "field";
    const field = bundle.fields[fieldKey] ?? bundle.fieldFallback;
    const message = translateValidationMessage(locale, item.msg ?? "");
    return `${field}: ${message}`;
  });

  const filtered = lines.filter(Boolean);
  return filtered.length > 0 ? filtered.join("\n") : bundle.validationError;
}

export function fallbackHttpMessage(statusCode?: number): string {
  const locale = getLocale();
  if (statusCode === 401) {
    return locale === "en" ? "Session expired. Please login again." : locale === "es" ? "Sesión expirada. Inicia sesión de nuevo." : "Sessão expirada. Faça login novamente.";
  }
  return bundles[locale].genericError;
}
