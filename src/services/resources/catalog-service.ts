import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  CatalogCartPreviewPayload,
  CatalogCartProductPayload,
  CatalogCartResponse,
  CatalogCheckoutPayload,
  CatalogHomeResponse,
  CatalogProductPageResponse,
  CatalogProductsPageResponse
} from "@/types/api/catalog";
import type { DeliveryMethodResponse } from "@/types/api/delivery-method";
import type { OrderResponse } from "@/types/api/order";
import type { PaymentMethodResponse } from "@/types/api/payment-method";

export const catalogService = {
  async getHome(storeSlug: string, params?: { search?: string }): Promise<CatalogHomeResponse> {
    try {
      const { data } = await createApiClient().get<CatalogHomeResponse>(`/catalog/${storeSlug}/home`, {
        params: {
          search: params?.search || undefined
        }
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getProducts(
    storeSlug: string,
    params?: { search?: string; categorySlug?: string }
  ): Promise<CatalogProductsPageResponse> {
    try {
      const { data } = await createApiClient().get<CatalogProductsPageResponse>(
        `/catalog/${storeSlug}/products`,
        {
        params: {
          search: params?.search || undefined,
          category_slug: params?.categorySlug || undefined
        }
        }
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getCategory(
    storeSlug: string,
    slug: string,
    params?: { search?: string }
  ): Promise<CatalogProductsPageResponse> {
    try {
      const { data } = await createApiClient().get<CatalogProductsPageResponse>(
        `/catalog/${storeSlug}/categories/${slug}`,
        {
        params: {
          search: params?.search || undefined
        }
        }
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getProduct(storeSlug: string, productSlug: string): Promise<CatalogProductPageResponse> {
    try {
      const { data } = await createApiClient().get<CatalogProductPageResponse>(
        `/catalog/${storeSlug}/products/${productSlug}`
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createCart(storeSlug: string, payload: { product: CatalogCartProductPayload }): Promise<CatalogCartResponse> {
    try {
      const { data } = await createApiClient().post<CatalogCartResponse>(`/catalog/${storeSlug}/carts`, payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async replaceCartProducts(
    storeSlug: string,
    cartId: string,
    products: CatalogCartProductPayload[]
  ): Promise<CatalogCartResponse | null> {
    try {
      const response = await createApiClient().put<CatalogCartResponse>(
        `/catalog/${storeSlug}/carts/${cartId}/products`,
        {
          products
        }
      );
      if (response.status === 204) {
        return null;
      }
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getCart(storeSlug: string, cartId: string): Promise<CatalogCartResponse> {
    try {
      const { data } = await createApiClient().get<CatalogCartResponse>(`/catalog/${storeSlug}/carts/${cartId}`);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteCart(storeSlug: string, cartId: string): Promise<void> {
    try {
      await createApiClient().delete(`/catalog/${storeSlug}/carts/${cartId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async listPaymentMethods(storeSlug: string): Promise<PaymentMethodResponse[]> {
    try {
      const { data } = await createApiClient().get<PaymentMethodResponse[]>(`/catalog/${storeSlug}/payment-methods`);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async listDeliveryMethods(storeSlug: string): Promise<DeliveryMethodResponse[]> {
    try {
      const { data } = await createApiClient().get<DeliveryMethodResponse[]>(`/catalog/${storeSlug}/delivery-methods`);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async previewCartTotal(
    storeSlug: string,
    cartId: string,
    payload: CatalogCartPreviewPayload
  ): Promise<number> {
    try {
      const { data } = await createApiClient().post<{ total_price: number }>(
        `/catalog/${storeSlug}/carts/${cartId}/preview-total`,
        payload
      );
      return Number(data.total_price || 0);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async checkoutCart(
    storeSlug: string,
    cartId: string,
    payload: CatalogCheckoutPayload
  ): Promise<OrderResponse> {
    try {
      const { data } = await createApiClient().post<OrderResponse>(
        `/catalog/${storeSlug}/carts/${cartId}/checkout`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
