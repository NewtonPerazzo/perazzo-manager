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
  paidFeature: string;
  monthlyOrderLimit: string;
  paidFeatures: Record<string, string>;
  detail: Array<{ test: RegExp; text: string }>;
};

const bundles: Record<Locale, TranslationBundle> = {
  "pt-br": {
    genericError: "Ocorreu um erro inesperado. Tente novamente.",
    validationError: "Confira os campos e tente novamente.",
    fieldFallback: "Campo",
    paidFeature: "Este recurso está disponível durante o teste grátis ou em planos pagos.",
    monthlyOrderLimit: "Você atingiu o limite mensal de pedidos do seu plano.",
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
      first_name: "Nome",
      products: "Produtos",
      amount: "Quantidade",
      color: "Cor",
      stock: "Estoque",
      category_ids: "Categorias",
      business_hours: "Horário de funcionamento",
      start_time: "Horário inicial",
      end_time: "Horário final"
    },
    paidFeatures: {
      "Cash register": "Caixa",
      "Courier management": "Motoboy",
      "Order editing": "Edição de pedidos",
      "WhatsApp orders": "Pedidos por WhatsApp"
    },
    detail: [
      { test: /^Too many requests\. Please try again later$/i, text: "Muitas tentativas. Tente novamente mais tarde." },
      { test: /^Invalid or expired token$/i, text: "Link inválido ou expirado." },
      { test: /^Invalid token payload$/i, text: "Token inválido." },
      { test: /^Could not send password reset email$/i, text: "Não foi possível enviar o e-mail de redefinição de senha." },
      { test: /^User not found$/i, text: "Usuário não encontrado." },
      { test: /^User is inactive$/i, text: "Usuário inativo." },
      { test: /^Store is currently closed$/i, text: "A loja está fechada no momento." },
      { test: /^Store not found$/i, text: "Loja não encontrada." },
      { test: /^Catalog not found$/i, text: "Catálogo não encontrado." },
      { test: /^User already has a store$/i, text: "Este usuário já possui uma loja." },
      { test: /^Store scope is required$/i, text: "Não foi possível identificar a loja desta operação." },
      { test: /^Cart not found$/i, text: "Carrinho não encontrado." },
      { test: /^Cart has no products$/i, text: "O carrinho não possui produtos." },
      { test: /^Cart customer data is required$/i, text: "Informe os dados do cliente para finalizar o pedido." },
      { test: /^Cart payment method is required$/i, text: "Selecione uma forma de pagamento." },
      { test: /^Delivery method is required$/i, text: "Selecione a forma de entrega." },
      { test: /^Delivery method is required when delivery is selected$/i, text: "Selecione o bairro para entrega." },
      { test: /^Address is required for delivery$/i, text: "Informe o endereço para entrega." },
      { test: /^Delivery method not found$/i, text: "Forma de entrega não encontrada." },
      { test: /^Delivery method name already exists$/i, text: "Já existe uma forma de entrega com esse nome." },
      { test: /^Payment method not found$/i, text: "Forma de pagamento não encontrada." },
      { test: /^Payment method name already exists$/i, text: "Já existe uma forma de pagamento com esse nome." },
      { test: /^Invalid credentials$/i, text: "E-mail ou senha inválidos." },
      { test: /^Invalid password$/i, text: "Senha inválida." },
      { test: /^Email already registered$/i, text: "Este e-mail já está cadastrado." },
      { test: /^Email is already registered$/i, text: "Este e-mail já está cadastrado." },
      { test: /^Email not verified$/i, text: "Verifique seu e-mail antes de entrar." },
      { test: /^Inactive user$/i, text: "Usuário inativo." },
      { test: /^Password must be at least/i, text: "A senha deve ter pelo menos 8 caracteres." },
      { test: /^Password must have at least/i, text: "A senha deve ter pelo menos 8 caracteres." },
      { test: /^Password must have at most/i, text: "A senha está muito longa." },
      { test: /^Password must contain.*uppercase/i, text: "A senha deve conter ao menos uma letra maiúscula." },
      { test: /^Password must contain.*number|^Password must contain.*digit/i, text: "A senha deve conter ao menos um número." },
      { test: /^Password must contain.*special/i, text: "A senha deve conter ao menos um caractere especial." },
      { test: /^Insufficient stock for product:/i, text: "Estoque insuficiente para este produto." },
      { test: /^Product not found:/i, text: "Produto não encontrado." },
      { test: /^Product not found$/i, text: "Produto não encontrado." },
      { test: /^One or more categories were not found$/i, text: "Uma ou mais categorias não foram encontradas." },
      { test: /^Category not found$/i, text: "Categoria não encontrada." },
      { test: /^Customer not found$/i, text: "Cliente não encontrado." },
      { test: /^Courier not found$/i, text: "Motoboy não encontrado." },
      { test: /^Courier adjustment not found$/i, text: "Ajuste do motoboy não encontrado." },
      { test: /^Cash entry not found$/i, text: "Lançamento de caixa não encontrado." },
      { test: /^Order not found$/i, text: "Pedido não encontrado." },
      { test: /^Order payload is required$/i, text: "Informe os dados do pedido." },
      { test: /^Order and payload are required$/i, text: "Informe o pedido e os dados de atualização." },
      { test: /^Unable to generate order number$/i, text: "Não foi possível gerar o número do pedido." },
      { test: /^Invalid time format:/i, text: "Formato de horário inválido." },
      { test: /^.+ requires start_time and end_time when enabled$/i, text: "Informe horário inicial e final para os dias ativos." },
      { test: /^.+ start_time must be before end_time$/i, text: "O horário inicial deve ser antes do horário final." },
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
    paidFeature: "This feature is available during the Free trial or on paid plans.",
    monthlyOrderLimit: "You reached your plan's monthly order limit.",
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
      first_name: "First name",
      products: "Products",
      amount: "Quantity",
      color: "Color",
      stock: "Stock",
      category_ids: "Categories",
      business_hours: "Business hours",
      start_time: "Start time",
      end_time: "End time"
    },
    paidFeatures: {
      "Cash register": "Cash register",
      "Courier management": "Rider management",
      "Order editing": "Order editing",
      "WhatsApp orders": "WhatsApp orders"
    },
    detail: [
      { test: /^Too many requests\. Please try again later$/i, text: "Too many attempts. Please try again later." },
      { test: /^Invalid or expired token$/i, text: "Invalid or expired link." },
      { test: /^Invalid token payload$/i, text: "Invalid token." },
      { test: /^Could not send password reset email$/i, text: "Could not send the password reset email." },
      { test: /^User not found$/i, text: "User not found." },
      { test: /^User is inactive$/i, text: "Inactive user." },
      { test: /^Store is currently closed$/i, text: "The store is currently closed." },
      { test: /^Store not found$/i, text: "Store not found." },
      { test: /^Catalog not found$/i, text: "Catalog not found." },
      { test: /^User already has a store$/i, text: "This user already has a store." },
      { test: /^Store scope is required$/i, text: "Could not identify the store for this operation." },
      { test: /^Cart not found$/i, text: "Cart not found." },
      { test: /^Cart has no products$/i, text: "The cart has no products." },
      { test: /^Cart customer data is required$/i, text: "Enter customer data to place the order." },
      { test: /^Cart payment method is required$/i, text: "Select a payment method." },
      { test: /^Delivery method is required$/i, text: "Select a delivery method." },
      { test: /^Delivery method is required when delivery is selected$/i, text: "Choose a delivery neighborhood." },
      { test: /^Address is required for delivery$/i, text: "Enter the delivery address." },
      { test: /^Delivery method not found$/i, text: "Delivery method not found." },
      { test: /^Delivery method name already exists$/i, text: "A delivery method with this name already exists." },
      { test: /^Payment method not found$/i, text: "Payment method not found." },
      { test: /^Payment method name already exists$/i, text: "A payment method with this name already exists." },
      { test: /^Invalid credentials$/i, text: "Invalid email or password." },
      { test: /^Invalid password$/i, text: "Invalid password." },
      { test: /^Email already registered$/i, text: "This email is already registered." },
      { test: /^Email is already registered$/i, text: "This email is already registered." },
      { test: /^Email not verified$/i, text: "Verify your email before signing in." },
      { test: /^Inactive user$/i, text: "Inactive user." },
      { test: /^Password must be at least/i, text: "Password must have at least 8 characters." },
      { test: /^Password must have at least/i, text: "Password must have at least 8 characters." },
      { test: /^Password must have at most/i, text: "Password is too long." },
      { test: /^Password must contain.*uppercase/i, text: "Password must contain at least one uppercase letter." },
      { test: /^Password must contain.*number|^Password must contain.*digit/i, text: "Password must contain at least one number." },
      { test: /^Password must contain.*special/i, text: "Password must contain at least one special character." },
      { test: /^Insufficient stock for product:/i, text: "Insufficient stock for this product." },
      { test: /^Product not found:/i, text: "Product not found." },
      { test: /^Product not found$/i, text: "Product not found." },
      { test: /^One or more categories were not found$/i, text: "One or more categories were not found." },
      { test: /^Category not found$/i, text: "Category not found." },
      { test: /^Customer not found$/i, text: "Customer not found." },
      { test: /^Courier not found$/i, text: "Rider not found." },
      { test: /^Courier adjustment not found$/i, text: "Rider adjustment not found." },
      { test: /^Cash entry not found$/i, text: "Cash entry not found." },
      { test: /^Order not found$/i, text: "Order not found." },
      { test: /^Order payload is required$/i, text: "Enter order data." },
      { test: /^Order and payload are required$/i, text: "Enter the order and update data." },
      { test: /^Unable to generate order number$/i, text: "Could not generate the order number." },
      { test: /^Invalid time format:/i, text: "Invalid time format." },
      { test: /^.+ requires start_time and end_time when enabled$/i, text: "Enter start and end time for active days." },
      { test: /^.+ start_time must be before end_time$/i, text: "Start time must be before end time." },
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
    paidFeature: "Esta función está disponible durante la prueba gratis o en planes pagos.",
    monthlyOrderLimit: "Alcanzaste el límite mensual de pedidos de tu plan.",
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
      first_name: "Nombre",
      products: "Productos",
      amount: "Cantidad",
      color: "Color",
      stock: "Stock",
      category_ids: "Categorías",
      business_hours: "Horario de funcionamiento",
      start_time: "Horario inicial",
      end_time: "Horario final"
    },
    paidFeatures: {
      "Cash register": "Caja",
      "Courier management": "Repartidores",
      "Order editing": "Edición de pedidos",
      "WhatsApp orders": "Pedidos por WhatsApp"
    },
    detail: [
      { test: /^Too many requests\. Please try again later$/i, text: "Demasiados intentos. Inténtalo de nuevo más tarde." },
      { test: /^Invalid or expired token$/i, text: "Enlace inválido o expirado." },
      { test: /^Invalid token payload$/i, text: "Token inválido." },
      { test: /^Could not send password reset email$/i, text: "No se pudo enviar el correo de restablecimiento de contraseña." },
      { test: /^User not found$/i, text: "Usuario no encontrado." },
      { test: /^User is inactive$/i, text: "Usuario inactivo." },
      { test: /^Store is currently closed$/i, text: "La tienda está cerrada en este momento." },
      { test: /^Store not found$/i, text: "Tienda no encontrada." },
      { test: /^Catalog not found$/i, text: "Catálogo no encontrado." },
      { test: /^User already has a store$/i, text: "Este usuario ya tiene una tienda." },
      { test: /^Store scope is required$/i, text: "No se pudo identificar la tienda de esta operación." },
      { test: /^Cart not found$/i, text: "Carrito no encontrado." },
      { test: /^Cart has no products$/i, text: "El carrito no tiene productos." },
      { test: /^Cart customer data is required$/i, text: "Ingresa los datos del cliente para finalizar el pedido." },
      { test: /^Cart payment method is required$/i, text: "Selecciona una forma de pago." },
      { test: /^Delivery method is required$/i, text: "Selecciona la forma de entrega." },
      { test: /^Delivery method is required when delivery is selected$/i, text: "Selecciona el barrio para la entrega." },
      { test: /^Address is required for delivery$/i, text: "Ingresa la dirección de entrega." },
      { test: /^Delivery method not found$/i, text: "Forma de entrega no encontrada." },
      { test: /^Delivery method name already exists$/i, text: "Ya existe una forma de entrega con ese nombre." },
      { test: /^Payment method not found$/i, text: "Forma de pago no encontrada." },
      { test: /^Payment method name already exists$/i, text: "Ya existe una forma de pago con ese nombre." },
      { test: /^Invalid credentials$/i, text: "Correo o contraseña inválidos." },
      { test: /^Invalid password$/i, text: "Contraseña inválida." },
      { test: /^Email already registered$/i, text: "Este correo ya está registrado." },
      { test: /^Email is already registered$/i, text: "Este correo ya está registrado." },
      { test: /^Email not verified$/i, text: "Verifica tu correo antes de ingresar." },
      { test: /^Inactive user$/i, text: "Usuario inactivo." },
      { test: /^Password must be at least/i, text: "La contraseña debe tener al menos 8 caracteres." },
      { test: /^Password must have at least/i, text: "La contraseña debe tener al menos 8 caracteres." },
      { test: /^Password must have at most/i, text: "La contraseña es demasiado larga." },
      { test: /^Password must contain.*uppercase/i, text: "La contraseña debe tener al menos una letra mayúscula." },
      { test: /^Password must contain.*number|^Password must contain.*digit/i, text: "La contraseña debe tener al menos un número." },
      { test: /^Password must contain.*special/i, text: "La contraseña debe tener al menos un carácter especial." },
      { test: /^Insufficient stock for product:/i, text: "Stock insuficiente para este producto." },
      { test: /^Product not found:/i, text: "Producto no encontrado." },
      { test: /^Product not found$/i, text: "Producto no encontrado." },
      { test: /^One or more categories were not found$/i, text: "Una o más categorías no fueron encontradas." },
      { test: /^Category not found$/i, text: "Categoría no encontrada." },
      { test: /^Customer not found$/i, text: "Cliente no encontrado." },
      { test: /^Courier not found$/i, text: "Repartidor no encontrado." },
      { test: /^Courier adjustment not found$/i, text: "Ajuste del repartidor no encontrado." },
      { test: /^Cash entry not found$/i, text: "Lanzamiento de caja no encontrado." },
      { test: /^Order not found$/i, text: "Pedido no encontrado." },
      { test: /^Order payload is required$/i, text: "Ingresa los datos del pedido." },
      { test: /^Order and payload are required$/i, text: "Ingresa el pedido y los datos de actualización." },
      { test: /^Unable to generate order number$/i, text: "No se pudo generar el número del pedido." },
      { test: /^Invalid time format:/i, text: "Formato de horario inválido." },
      { test: /^.+ requires start_time and end_time when enabled$/i, text: "Ingresa horario inicial y final para los días activos." },
      { test: /^.+ start_time must be before end_time$/i, text: "El horario inicial debe ser antes del horario final." },
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
  if (/valid boolean/i.test(msg)) return locale === "en" ? "Choose a valid option." : locale === "es" ? "Elige una opción válida." : "Escolha uma opção válida.";
  if (/valid integer|valid number|finite number/i.test(msg)) return locale === "en" ? "Enter a valid number." : locale === "es" ? "Ingresa un número válido." : "Informe um número válido.";
  if (/valid email address/i.test(msg)) return locale === "en" ? "Enter a valid email address." : locale === "es" ? "Ingresa un correo válido." : "Informe um e-mail válido.";
  if (/at least\s*8|8 characters/i.test(msg)) return locale === "en" ? "Use at least 8 characters." : locale === "es" ? "Usa al menos 8 caracteres." : "Use pelo menos 8 caracteres.";
  if (/too short|string should have at least|string must contain at least/i.test(msg)) return locale === "en" ? "Value is too short." : locale === "es" ? "El valor es muy corto." : "O valor está muito curto.";
  if (/too long|string should have at most|string must contain at most/i.test(msg)) return locale === "en" ? "Value is too long." : locale === "es" ? "El valor es muy largo." : "O valor está muito longo.";
  if (/greater than or equal|greater than/i.test(msg)) return locale === "en" ? "Enter a higher value." : locale === "es" ? "Ingresa un valor mayor." : "Informe um valor maior.";
  if (/less than or equal|less than/i.test(msg)) return locale === "en" ? "Enter a lower value." : locale === "es" ? "Ingresa un valor menor." : "Informe um valor menor.";
  if (/number|digit/i.test(msg)) return locale === "en" ? "Use at least one number." : locale === "es" ? "Usa al menos un número." : "Use pelo menos um número.";
  if (/special|symbol|[!@#$%^&*]/i.test(msg)) return locale === "en" ? "Use at least one special character." : locale === "es" ? "Usa al menos un carácter especial." : "Use pelo menos um caractere especial.";
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

  const paidFeatureMatch = detail.match(/^(.+?)\s+is available during the Free trial or on paid plans$/i);
  if (paidFeatureMatch) {
    const feature = bundle.paidFeatures[paidFeatureMatch[1]] ?? "";
    return feature ? `${feature}: ${bundle.paidFeature}` : bundle.paidFeature;
  }

  if (/^Monthly order limit reached for the .+ plan$/i.test(detail)) {
    return bundle.monthlyOrderLimit;
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
