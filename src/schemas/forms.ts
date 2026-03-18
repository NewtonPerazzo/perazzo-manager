import { z } from "zod";

import type {
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UserLoginPayload,
  UserRegisterPayload
} from "@/types/api/auth";
import type { CategoryCreatePayload } from "@/types/api/category";
import type { CustomerCreatePayload } from "@/types/api/customer";
import type { DeliveryMethodCreatePayload } from "@/types/api/delivery-method";
import type { OrderCreatePayload } from "@/types/api/order";
import type { PaymentMethodCreatePayload } from "@/types/api/payment-method";
import type { ProductCreatePayload } from "@/types/api/product";
import type { StoreCreatePayload } from "@/types/api/store";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const loginSchema: z.ZodType<UserLoginPayload> = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6)
});

export const registerSchema: z.ZodType<UserRegisterPayload> = z.object({
  name: optionalText,
  last_name: optionalText,
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .refine((value) => /[A-Z]/.test(value))
    .refine((value) => /[0-9]/.test(value))
    .refine((value) => /[!@#$%^&*]/.test(value)),
  birth_date: optionalText,
  photo: optionalText
});

export const forgotPasswordSchema: z.ZodType<ForgotPasswordPayload> = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema: z.ZodType<ResetPasswordPayload> = z.object({
  token: z.string().trim().min(1),
  new_password: z.string().min(6)
});

export const categorySchema: z.ZodType<CategoryCreatePayload> = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalText
});

export const customerSchema: z.ZodType<CustomerCreatePayload> = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(30),
  address: optionalText,
  neighborhood: optionalText,
  email: optionalText.refine((value) => !value || z.string().email().safeParse(value).success)
});

export const deliveryMethodSchema: z.ZodType<DeliveryMethodCreatePayload> = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.coerce.number().min(0),
  description: optionalText
});

export const paymentMethodSchema: z.ZodType<PaymentMethodCreatePayload> = z.object({
  name: z.string().trim().min(1).max(80)
});

export const orderFormSchema = z.object({
  products: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        amount: z.coerce.number().int().min(1)
      })
    )
    .min(1),
  customer_name: z.string().trim().max(120).optional().or(z.literal("")),
  customer_phone: z.string().trim().max(30).optional().or(z.literal("")),
  customer_address: optionalText,
  customer_neighborhood: optionalText,
  customer_email: optionalText.refine((value) => !value || z.string().email().safeParse(value).success),
  payment_method: z.string().trim().min(1).max(60),
  delivery_method_id: z.string().uuid().optional().or(z.literal("")),
  is_to_deliver: z.boolean().optional()
}).superRefine((value, ctx) => {
  if (value.is_to_deliver && !value.customer_address?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customer_address"],
      message: "Address is required for delivery"
    });
  }
  if (value.is_to_deliver && !value.delivery_method_id?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["delivery_method_id"],
      message: "Delivery method is required for delivery"
    });
  }
});

export const storeSchema: z.ZodType<StoreCreatePayload> = z.object({
  name: z.string().trim().min(1),
  description: optionalText,
  does_delivery: z.boolean().optional(),
  does_pick_up: z.boolean().optional(),
  phone: optionalText,
  whatsapp: optionalText,
  address: optionalText,
  instagram: optionalText,
  email: optionalText.refine((value) => !value || z.string().email().safeParse(value).success),
  logo: optionalText,
  color: optionalText.refine((value) => !value || /^#([0-9a-fA-F]{6})$/.test(value)),
  has_catalog_active: z.boolean().optional()
});

export const productSchema: z.ZodType<ProductCreatePayload> = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.coerce.number().positive(),
  description: optionalText,
  stock: z.coerce.number().int().min(0).optional(),
  image_url: optionalText,
  category_ids: z.array(z.string().uuid()).default([])
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.coerce.number().positive(),
  description: optionalText,
  stock: z.coerce.number().int().min(0).optional(),
  image_url: optionalText,
  category_id: z.string().uuid().optional().or(z.literal(""))
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function mapProductFormToPayload(values: ProductFormValues): ProductCreatePayload {
  return productSchema.parse({
    ...values,
    category_ids: values.category_id ? [values.category_id] : []
  });
}

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function mapOrderFormToPayload(values: OrderFormValues): OrderCreatePayload {
  const customerName = values.customer_name?.trim() || "Cliente";
  const customerPhone = values.customer_phone?.trim() || "-";

  return {
    products: values.products,
    customer: {
      name: customerName,
      phone: customerPhone,
      address: values.customer_address || undefined,
      neighborhood: values.customer_neighborhood || undefined,
      email: values.customer_email || undefined
    },
    payment_method: values.payment_method,
    delivery_method_id: values.delivery_method_id || undefined,
    is_to_deliver: Boolean(values.is_to_deliver)
  };
}
