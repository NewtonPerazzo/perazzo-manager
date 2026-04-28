# Perazzo Manager System Documentation

This document explains how the frontend works, how it talks to the backend, how the main user flows are implemented, and which files are responsible for each step.

## Architecture Overview

Perazzo Manager is a Next.js App Router application. Route files under `src/app` define URLs, while most data loading happens in client components through services in `src/services/resources`.

- `src/app`: Next.js route tree, layouts, pages, and the local session API route.
- `src/components`: UI organized by Atomic Design (`atoms`, `molecules`, `organisms`, `templates`).
- `src/components/templates`: page-level client components that fetch data and coordinate flows.
- `src/services/http/config.ts`: resolves the backend base URL from `NEXT_PUBLIC_PERAZZO_API_URL`.
- `src/services/http/client.ts`: creates the Axios client, attaches auth headers, normalizes errors, and handles `401` logout behavior.
- `src/services/resources/*.ts`: typed API clients grouped by business resource.
- `src/store`: Zustand stores for auth, catalog cart, and UI feedback.
- `src/schemas/forms.ts`: Zod schemas and form-to-API mapping helpers.
- `src/types/api`: TypeScript API contracts mirrored from the backend.
- `src/i18n`: local dictionaries and translation provider.

For local Docker development, use:

```env
NEXT_PUBLIC_PERAZZO_API_URL=http://localhost:8001/api/v1
```

## Authentication and Session Flow

The login screen is `src/app/login/page.tsx`. It validates with `loginSchema` from `src/schemas/forms.ts`, then calls `authService.login()` in `src/services/resources/auth-service.ts`, which sends `POST /auth/login` to `POST /api/v1/auth/login`.

After login, the returned token is stored in `useAuthStore` from `src/store/auth-store.ts` and persisted as `pm-auth-store`. The same token is also sent to the local Next route `src/app/api/session/route.ts` through `sessionService.setToken()` from `src/services/resources/session-service.ts`, which stores the `pm_access_token` cookie.

The page then calls `authService.getMe()`, which sends `GET /auth/me` to `GET /api/v1/auth/me`, and stores the user's display name/email/photo in Zustand.

Dashboard protection is handled by `src/middleware.ts`. It reads the `pm_access_token` cookie using the constant from `src/lib/session.ts`; requests to `/dashboard/*` without the cookie are redirected to `/login`.

The Axios client in `src/services/http/client.ts` handles invalid sessions. On `401`, it clears `pm-auth-store`, clears `pm-catalog-cart-store`, calls `DELETE /api/session`, and redirects to `/login`.

Registration is implemented by `src/app/register/page.tsx`. It validates with `registerSchema`, calls `authService.register()`, and sends `POST /auth/register` to `POST /api/v1/auth/register`. On success, it redirects to `/login?registered=1`.

Password recovery starts in `src/app/forgot-password/page.tsx`. The form validates the email with `forgotPasswordSchema` from `src/schemas/forms.ts` and calls `authService.forgotPassword()` in `src/services/resources/auth-service.ts`, which sends `POST /auth/password/forgot` to `POST /api/v1/auth/password/forgot`. The backend sends the reset email through SMTP and returns only a generic `message`; the frontend never receives or displays the reset token. After a successful request, the page switches to an email-sent success state that asks the user to check their inbox.

The email link opens `src/app/reset-password/page.tsx` with the token in the URL query string, for example `/reset-password?token=<token>`. The page reads the token with `useSearchParams()`, stores it in a hidden form field, and only displays the new password input. Submitting calls `authService.resetPassword()` -> `POST /auth/password/reset` -> `POST /api/v1/auth/password/reset`. After the API confirms the password change, the page redirects to `/login`.

## Dashboard Data Flow

Authenticated dashboard pages live under `src/app/(client-area)/dashboard`. The shared layout is `src/app/(client-area)/dashboard/layout.tsx`, which renders `ClientShell` from `src/components/organisms/client-shell.tsx`.

`ClientShell` renders the topbar, sidebar, mobile navigation, locale selector, and toast viewport. The current user name comes from `useAuthStore`.

Most dashboard route files pass empty initial data into templates. The templates fetch data in `useEffect` after reading the token from Zustand. The current app therefore uses the App Router for routing/layout, but data fetching is mostly client-side.

## Store Flow

The dashboard home route is `src/app/(client-area)/dashboard/page.tsx`, which renders `HomeTemplate` from `src/components/templates/dashboard/home-template.tsx`.

`HomeTemplate` loads the store with `storeService.getMyStore(token)` from `src/services/resources/store-service.ts`, which calls `GET /store/me` -> `GET /api/v1/store/me`.

Store creation submits `StoreForm` from `src/components/molecules/store/store-form.tsx` and calls `storeService.createStore()` -> `POST /store` -> `POST /api/v1/store`.

Store editing calls `storeService.updateStore()` or `storeService.updateStorePartial()` -> `PATCH /store/me` -> `PATCH /api/v1/store/me`.

The open/closed toggle updates today's business hours through `storeService.updateStorePartial()`. The service also exposes `toggleTodayOpen()`, mapped to `PATCH /store/me/today-open` -> `PATCH /api/v1/store/me/today-open`.

## Products and Categories

The products route is `src/app/(client-area)/dashboard/products/page.tsx`, which renders `ProductsTemplate` from `src/components/templates/dashboard/products-template.tsx`.

`ProductsTemplate` loads products with `productService.list()` from `src/services/resources/product-service.ts`, calling `GET /products` -> `GET /api/v1/products`. It sends pagination, search, category, and sort params, then reads `X-Total-Count`.

Product creation and editing are handled by `ProductForm` in `src/components/molecules/product/product-form.tsx`. The template calls:

- `productService.create()` -> `POST /products` -> `POST /api/v1/products`.
- `productService.update()` -> `PATCH /products/{productId}` -> `PATCH /api/v1/products/{product_id}`.
- `productService.remove()` -> `DELETE /products/{productId}` -> `DELETE /api/v1/products/{product_id}`.

Categories are loaded for the product form with `categoryService.list()` -> `GET /categories` -> `GET /api/v1/categories`.

The categories route is `src/app/(client-area)/dashboard/categories/page.tsx`, which renders `CategoriesTemplate` from `src/components/templates/dashboard/categories-template.tsx`. It uses `src/services/resources/category-service.ts`:

- `list()` -> `GET /categories` -> `GET /api/v1/categories`.
- `create()` -> `POST /categories` -> `POST /api/v1/categories`.
- `update()` -> `PATCH /categories/{categoryId}` -> `PATCH /api/v1/categories/{category_id}`.
- `remove()` -> `DELETE /categories/{categoryId}` -> `DELETE /api/v1/categories/{category_id}`.
- `reorder()` -> `POST /categories/reorder` -> `POST /api/v1/categories/reorder`.

## Customers

The customers route is `src/app/(client-area)/dashboard/customers/page.tsx`, rendered by `CustomersTemplate` from `src/components/templates/dashboard/customers-template.tsx`.

`CustomersTemplate` uses `customerService` from `src/services/resources/customer-service.ts`:

- `list()` -> `GET /customers` -> `GET /api/v1/customers`.
- `create()` -> `POST /customers` -> `POST /api/v1/customers`.
- `update()` -> `PATCH /customers/{customerId}` -> `PATCH /api/v1/customers/{customer_id}`.
- `remove()` -> `DELETE /customers/{customerId}` -> `DELETE /api/v1/customers/{customer_id}`.

`OrdersTemplate` also uses `customerService.update()` when a WhatsApp flow needs to save or fix a customer phone number.

## Payment and Delivery Methods

Payment methods are managed by `src/app/(client-area)/dashboard/payment-methods/page.tsx` and `src/components/templates/dashboard/payment-methods-template.tsx`, using `src/services/resources/payment-method-service.ts`:

- `list()` -> `GET /payment-methods` -> `GET /api/v1/payment-methods`.
- `create()` -> `POST /payment-methods` -> `POST /api/v1/payment-methods`.
- `update()` -> `PATCH /payment-methods/{paymentMethodId}` -> `PATCH /api/v1/payment-methods/{payment_method_id}`.
- `remove()` -> `DELETE /payment-methods/{paymentMethodId}` -> `DELETE /api/v1/payment-methods/{payment_method_id}`.

Delivery methods are managed by `src/app/(client-area)/dashboard/delivery-methods/page.tsx` and `src/components/templates/dashboard/delivery-methods-template.tsx`, using `src/services/resources/delivery-method-service.ts`:

- `list()` -> `GET /delivery-methods` -> `GET /api/v1/delivery-methods`.
- `create()` -> `POST /delivery-methods` -> `POST /api/v1/delivery-methods`.
- `update()` -> `PATCH /delivery-methods/{deliveryMethodId}` -> `PATCH /api/v1/delivery-methods/{delivery_method_id}`.
- `remove()` -> `DELETE /delivery-methods/{deliveryMethodId}` -> `DELETE /api/v1/delivery-methods/{delivery_method_id}`.

Delivery methods are used as neighborhoods or delivery areas during checkout and order creation.

## Dashboard Order Flow

The orders route is `src/app/(client-area)/dashboard/orders/page.tsx`, rendered by `OrdersTemplate` from `src/components/templates/dashboard/orders-template.tsx`.

`OrdersTemplate` loads orders through `orderService.list()` in `src/services/resources/order-service.ts`. Without a search term it calls `GET /orders` -> `GET /api/v1/orders`; with search it calls `GET /orders/search` -> `GET /api/v1/orders/search`. It passes `skip`, `limit`, `order_date`, and `q`, then reads `X-Total-Count`.

When the order modal opens, `OrdersTemplate` loads products, payment methods, delivery methods, couriers, store WhatsApp, and store slug through `productService`, `paymentMethodService`, `deliveryMethodService`, `courierService`, and `storeService`.

The form is `OrderForm` in `src/components/molecules/order/order-form.tsx`. It validates with `orderFormSchema`, maps values with `mapOrderFormToPayload()` from `src/schemas/forms.ts`, and previews totals through `orderService.previewTotal()` -> `POST /orders/preview-total` -> `POST /api/v1/orders/preview-total`.

Saving an order calls:

- `orderService.create()` -> `POST /orders` -> `POST /api/v1/orders`.
- `orderService.update()` -> `PATCH /orders/{orderId}` -> `PATCH /api/v1/orders/{order_id}`.
- `orderService.remove()` -> `DELETE /orders/{orderId}` -> `DELETE /api/v1/orders/{order_id}`.
- `orderService.updateStatus()` -> `PUT /orders/{orderId}/status` -> `PUT /api/v1/orders/{order_id}/status`.

WhatsApp messages are built in `OrdersTemplate` with `buildOrderWhatsappMessage()` from `src/lib/order-whatsapp-message.ts` and phone helpers from `src/lib/phone.ts`.

## Public Catalog Flow

Public catalog routes live under `src/app/catalog`.

- `src/app/catalog/[storeSlug]/page.tsx` renders `CatalogHomeTemplate`.
- `src/app/catalog/[storeSlug]/products/page.tsx` renders `CatalogProductsTemplate`.
- `src/app/catalog/[storeSlug]/category/[slug]/page.tsx` renders `CatalogProductsTemplate` in category mode.
- `src/app/catalog/[storeSlug]/product/[productSlug]/page.tsx` renders `CatalogProductTemplate`.
- `src/app/catalog/[storeSlug]/cart/page.tsx` renders `CatalogCartTemplate`.

The catalog uses `catalogService` from `src/services/resources/catalog-service.ts`:

- `getHome()` -> `GET /catalog/{storeSlug}/home` -> `GET /api/v1/catalog/{store_slug}/home`.
- `getProducts()` -> `GET /catalog/{storeSlug}/products` -> `GET /api/v1/catalog/{store_slug}/products`.
- `getCategory()` -> `GET /catalog/{storeSlug}/categories/{slug}` -> `GET /api/v1/catalog/{store_slug}/categories/{category_slug}`.
- `getProduct()` -> `GET /catalog/{storeSlug}/products/{productSlug}` -> `GET /api/v1/catalog/{store_slug}/products/{product_slug}`.

`CatalogHomeTemplate`, `CatalogProductsTemplate`, and `CatalogProductTemplate` receive route params from App Router pages and load data in `useEffect`. Search is debounced before reloading.

`CatalogShell` in `src/components/organisms/catalog/catalog-shell.tsx` receives public store data and applies catalog branding, navigation, and open/closed state.

## Public Cart and Checkout Flow

The public cart state is stored in `useCatalogCartStore` from `src/store/catalog-cart-store.ts`, persisted as `pm-catalog-cart-store`.

When a customer changes quantity, `setQuantity()` updates local state optimistically and syncs with the backend:

- If there is no cart id, it calls `catalogService.createCart()` -> `POST /catalog/{storeSlug}/carts` -> `POST /api/v1/catalog/{store_slug}/carts`.
- If a cart exists, it calls `catalogService.replaceCartProducts()` -> `PUT /catalog/{storeSlug}/carts/{cartId}/products` -> `PUT /api/v1/catalog/{store_slug}/carts/{cart_id}/products`.
- If the backend returns `204`, the local cart is cleared.
- If the backend rejects the update, local state is rolled back and a toast is shown.

`CatalogCartTemplate` loads checkout data:

- `catalogService.getHome()` for store/catalog data.
- `catalogService.listPaymentMethods()` -> `GET /catalog/{storeSlug}/payment-methods`.
- `catalogService.listDeliveryMethods()` -> `GET /catalog/{storeSlug}/delivery-methods`.
- `catalogService.getCart()` -> `GET /catalog/{storeSlug}/carts/{cartId}`.

Checkout steps are: review cart, choose payment/delivery, fill customer data, and submit.

Total preview uses `catalogService.previewCartTotal()` -> `POST /catalog/{storeSlug}/carts/{cartId}/preview-total` -> `POST /api/v1/catalog/{store_slug}/carts/{cart_id}/preview-total`.

Final checkout uses `catalogService.checkoutCart()` -> `POST /catalog/{storeSlug}/carts/{cartId}/checkout` -> `POST /api/v1/catalog/{store_slug}/carts/{cart_id}/checkout`. If the store accepts WhatsApp forwarding and has a valid number, the frontend opens WhatsApp with a generated order message.

## Cash Register

The cash register route is `src/app/(client-area)/dashboard/cash-register/page.tsx`, rendered by `CashRegisterTemplate` from `src/components/templates/dashboard/cash-register-template.tsx`.

The service is `src/services/resources/cash-register-service.ts`:

- `getSummary()` -> `GET /cash-register/summary` -> `GET /api/v1/cash-register/summary`.
- `createEntry()` -> `POST /cash-register/entries` -> `POST /api/v1/cash-register/entries`.
- `updateEntry()` -> `PATCH /cash-register/entries/{entryId}` -> `PATCH /api/v1/cash-register/entries/{entry_id}`.
- `deleteEntry()` -> `DELETE /cash-register/entries/{entryId}` -> `DELETE /api/v1/cash-register/entries/{entry_id}`.

The template switches period views, selects dates, displays automatic order revenue, and manages manual entries, expenses, and profit withdrawals.

## Couriers

The couriers route is `src/app/(client-area)/dashboard/couriers/page.tsx`, rendered by `CouriersTemplate` from `src/components/templates/dashboard/couriers-template.tsx`.

The service is `src/services/resources/courier-service.ts`:

- `list()` -> `GET /couriers` -> `GET /api/v1/couriers`.
- `create()` -> `POST /couriers` -> `POST /api/v1/couriers`.
- `update()` -> `PATCH /couriers/{courierId}` -> `PATCH /api/v1/couriers/{courier_id}`.
- `remove()` -> `DELETE /couriers/{courierId}` -> `DELETE /api/v1/couriers/{courier_id}`.
- `summary()` -> `GET /couriers/summary` -> `GET /api/v1/couriers/summary`.
- `addAdjustment()` -> `POST /couriers/adjustments` -> `POST /api/v1/couriers/adjustments`.
- `updateAdjustment()` -> `PATCH /couriers/adjustments/{adjustmentId}` -> `PATCH /api/v1/couriers/adjustments/{adjustment_id}`.
- `deleteAdjustment()` -> `DELETE /couriers/adjustments/{adjustmentId}` -> `DELETE /api/v1/couriers/adjustments/{adjustment_id}`.

Couriers are also loaded by `OrdersTemplate` so delivery orders can be associated with a courier.

## Error Handling and UI Feedback

All backend calls go through `createApiClient()` and `normalizeApiError()` in `src/services/http/client.ts`. Backend validation details are translated by `src/services/http/error-translator.ts`. Loading states and toasts are coordinated through `useUiFeedback()` in `src/hooks/use-ui-feedback.ts` and `useUiFeedbackStore` in `src/store/ui-feedback-store.ts`.

## Current Data Flow Pattern

The current pattern is:

1. A route file in `src/app` renders a template.
2. The template reads the token from `useAuthStore` when needed.
3. The template calls a resource service from `src/services/resources`.
4. The service creates an Axios client and calls the backend endpoint.
5. The template stores the response in local React state.
6. Mutations call a service, update local state, and often call `router.refresh()`.

Public catalog pages follow the same pattern without an auth token, using route params such as `storeSlug` and `productSlug`.
