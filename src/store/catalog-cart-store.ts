"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { catalogService } from "@/services/resources/catalog-service";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { CatalogProductResponse } from "@/types/api/catalog";

type CartMap = Record<string, number>;
type CartPriceMap = Record<string, number>;

export interface CatalogCheckoutDraft {
  paymentMethodId: string;
  isToDeliver: boolean;
  deliveryMethodId: string;
  firstName: string;
  lastName: string;
  whatsapp: string;
  neighborhood: string;
  address: string;
  observation: string;
}

interface CatalogCartState {
  storeSlug: string | null;
  cartId: string | null;
  cartSecret: string | null;
  itemsByProductId: CartMap;
  pricesByProductId: CartPriceMap;
  checkoutDraft: CatalogCheckoutDraft;
  isSyncing: boolean;
  setStoreSlug: (storeSlug: string) => void;
  setQuantity: (product: CatalogProductResponse, amount: number) => Promise<void>;
  increment: (product: CatalogProductResponse) => Promise<void>;
  decrement: (product: CatalogProductResponse) => Promise<void>;
  updateCheckoutDraft: (partial: Partial<CatalogCheckoutDraft>) => void;
  resetCheckoutDraft: () => void;
  clearCart: () => void;
  resetSession: () => void;
}

const DEFAULT_CHECKOUT_DRAFT: CatalogCheckoutDraft = {
  paymentMethodId: "",
  isToDeliver: false,
  deliveryMethodId: "",
  firstName: "",
  lastName: "",
  whatsapp: "",
  neighborhood: "",
  address: "",
  observation: ""
};

function toProductsPayload(itemsByProductId: CartMap) {
  return Object.entries(itemsByProductId)
    .filter(([, amount]) => amount > 0)
    .map(([productId, amount]) => ({
      product_id: productId,
      amount
    }));
}

function isStockWarningMessage(message: string): boolean {
  return /estoque insuficiente|insufficient stock|stock insuficiente/i.test(message);
}

export const useCatalogCartStore = create<CatalogCartState>()(
  persist(
    (set, get) => ({
      storeSlug: null,
      cartId: null,
      cartSecret: null,
      itemsByProductId: {},
      pricesByProductId: {},
      checkoutDraft: DEFAULT_CHECKOUT_DRAFT,
      isSyncing: false,
      setStoreSlug: (storeSlug) => {
        const current = get().storeSlug;
        if (current && current !== storeSlug) {
          set({
            storeSlug,
            cartId: null,
            cartSecret: null,
            itemsByProductId: {},
            pricesByProductId: {},
            checkoutDraft: DEFAULT_CHECKOUT_DRAFT,
            isSyncing: false
          });
          return;
        }
        set({ storeSlug });
      },
      updateCheckoutDraft: (partial) => {
        set((state) => ({
          checkoutDraft: {
            ...state.checkoutDraft,
            ...partial
          }
        }));
      },
      resetCheckoutDraft: () => set({ checkoutDraft: DEFAULT_CHECKOUT_DRAFT }),
      clearCart: () =>
        set({
          cartId: null,
          cartSecret: null,
          itemsByProductId: {},
          pricesByProductId: {},
          checkoutDraft: DEFAULT_CHECKOUT_DRAFT,
          isSyncing: false
        }),
      resetSession: () =>
        set({
          storeSlug: null,
          cartId: null,
          cartSecret: null,
          itemsByProductId: {},
          pricesByProductId: {},
          checkoutDraft: DEFAULT_CHECKOUT_DRAFT,
          isSyncing: false
        }),
      setQuantity: async (product, amount) => {
        const normalized = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;

        const current = get().itemsByProductId;
        const currentPrices = get().pricesByProductId;
        const nextItemsByProductId: CartMap = { ...current };
        const nextPricesByProductId: CartPriceMap = { ...currentPrices };

        if (normalized <= 0) {
          delete nextItemsByProductId[product.id];
          delete nextPricesByProductId[product.id];
        } else {
          nextItemsByProductId[product.id] = normalized;
          nextPricesByProductId[product.id] = product.price;
        }

        set({ itemsByProductId: nextItemsByProductId, pricesByProductId: nextPricesByProductId, isSyncing: true });

        try {
          const payloadProducts = toProductsPayload(nextItemsByProductId);
          const { cartId, cartSecret, storeSlug } = get();
          if (!storeSlug) {
            set({ itemsByProductId: current, pricesByProductId: currentPrices, isSyncing: false });
            return;
          }

          if (!cartId && payloadProducts.length > 0) {
            const first = payloadProducts[0];
            const cart = await catalogService.createCart(storeSlug, { product: first });

            if (payloadProducts.length > 1) {
              const replaced = await catalogService.replaceCartProducts(storeSlug, cart.id, cart.cart_secret, payloadProducts);
              set({
                cartId: replaced?.id ?? cart.id,
                cartSecret: replaced?.cart_secret ?? cart.cart_secret,
                itemsByProductId: nextItemsByProductId,
                pricesByProductId: nextPricesByProductId,
                isSyncing: false
              });
              return;
            }

            set({
              cartId: cart.id,
              cartSecret: cart.cart_secret,
              itemsByProductId: nextItemsByProductId,
              pricesByProductId: nextPricesByProductId,
              isSyncing: false
            });
            return;
          }

          if (!cartId && payloadProducts.length === 0) {
            set({ cartId: null, cartSecret: null, itemsByProductId: {}, pricesByProductId: {}, isSyncing: false });
            return;
          }

          if (!cartId || !cartSecret) {
            set({ isSyncing: false });
            return;
          }

          const replaced = await catalogService.replaceCartProducts(storeSlug, cartId, cartSecret, payloadProducts);
          if (!replaced) {
            set({
              cartId: null,
              cartSecret: null,
              itemsByProductId: {},
              pricesByProductId: {},
              checkoutDraft: DEFAULT_CHECKOUT_DRAFT,
              isSyncing: false
            });
            return;
          }

          set({
            cartId: replaced.id,
            cartSecret: replaced.cart_secret,
            itemsByProductId: nextItemsByProductId,
            pricesByProductId: nextPricesByProductId,
            isSyncing: false
          });
        } catch (error) {
          set({ itemsByProductId: current, pricesByProductId: currentPrices, isSyncing: false });
          const message = error instanceof Error ? error.message : "Unexpected error";
          useUiFeedbackStore.getState().pushToast({
            message,
            variant: isStockWarningMessage(message) ? "warning" : "error"
          });
        }
      },
      increment: async (product) => {
        const current = get().itemsByProductId[product.id] ?? 0;
        await get().setQuantity(product, current + 1);
      },
      decrement: async (product) => {
        const current = get().itemsByProductId[product.id] ?? 0;
        await get().setQuantity(product, current - 1);
      }
    }),
    {
      name: "pm-catalog-cart-store"
    }
  )
);

export function selectCatalogCartTotalItems(itemsByProductId: CartMap): number {
  return Object.values(itemsByProductId).reduce((sum, amount) => sum + amount, 0);
}

export function selectCatalogCartProductsTotal(itemsByProductId: CartMap, pricesByProductId: CartPriceMap): number {
  return Object.entries(itemsByProductId).reduce((sum, [productId, amount]) => {
    const price = pricesByProductId[productId] ?? 0;
    return sum + (amount * price);
  }, 0);
}
