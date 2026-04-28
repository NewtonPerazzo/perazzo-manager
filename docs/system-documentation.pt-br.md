# Documentação do Sistema Perazzo Manager

Este documento explica como o frontend funciona, como ele conversa com o backend, como os principais fluxos de usuário foram implementados e quais arquivos são responsáveis por cada etapa.

## Visão Geral da Arquitetura

O Perazzo Manager é uma aplicação Next.js com App Router. Arquivos em `src/app` definem as URLs, enquanto a maior parte do carregamento de dados acontece em client components através dos services em `src/services/resources`.

- `src/app`: árvore de rotas Next.js, layouts, pages e rota local de sessão.
- `src/components`: UI organizada com Atomic Design (`atoms`, `molecules`, `organisms`, `templates`).
- `src/components/templates`: componentes client de nível de página que buscam dados e coordenam fluxos.
- `src/services/http/config.ts`: resolve a URL base do backend a partir de `NEXT_PUBLIC_PERAZZO_API_URL`.
- `src/services/http/client.ts`: cria o client Axios, adiciona headers de auth, normaliza erros e trata logout em `401`.
- `src/services/resources/*.ts`: clients tipados da API agrupados por recurso.
- `src/store`: stores Zustand para auth, carrinho do catálogo e feedback de UI.
- `src/schemas/forms.ts`: schemas Zod e helpers que convertem formulários para payloads da API.
- `src/types/api`: contratos TypeScript espelhados do backend.
- `src/i18n`: dicionários locais e provider de tradução.

Para desenvolvimento local com Docker, use:

```env
NEXT_PUBLIC_PERAZZO_API_URL=http://localhost:8001/api/v1
```

## Fluxo de Autenticação e Sessão

A tela de login é `src/app/login/page.tsx`. Ela valida com `loginSchema` de `src/schemas/forms.ts` e chama `authService.login()` em `src/services/resources/auth-service.ts`, que envia `POST /auth/login` para `POST /api/v1/auth/login`.

Depois do login, o token retornado é salvo em `useAuthStore` de `src/store/auth-store.ts`, persistido como `pm-auth-store`. O mesmo token também é enviado para a rota local Next `src/app/api/session/route.ts` por `sessionService.setToken()` em `src/services/resources/session-service.ts`, salvando o cookie `pm_access_token`.

Em seguida a página chama `authService.getMe()`, que envia `PUT /auth/me` para `PUT /api/v1/auth/me`, e salva nome/email do usuário no Zustand.

A proteção do dashboard fica em `src/middleware.ts`. Ele lê o cookie `pm_access_token` usando a constante de `src/lib/session.ts`; requests para `/dashboard/*` sem esse cookie são redirecionados para `/login`.

O client Axios em `src/services/http/client.ts` trata sessões inválidas. Em caso de `401`, ele limpa `pm-auth-store`, limpa `pm-catalog-cart-store`, chama `DELETE /api/session` e redireciona para `/login`.

O cadastro é implementado por `src/app/register/page.tsx`. Ele valida com `registerSchema`, chama `authService.register()` e envia `POST /auth/register` para `POST /api/v1/auth/register`. Em caso de sucesso, redireciona para `/login?registered=1`.

A recuperação de senha usa `authService.forgotPassword()` para `POST /auth/password/forgot` e `authService.resetPassword()` para `POST /auth/password/reset`.

## Fluxo de Dados do Dashboard

Páginas autenticadas ficam em `src/app/(client-area)/dashboard`. O layout compartilhado é `src/app/(client-area)/dashboard/layout.tsx`, que renderiza `ClientShell` em `src/components/organisms/client-shell.tsx`.

`ClientShell` renderiza topbar, sidebar, navegação mobile, seletor de idioma e viewport de toasts. O nome do usuário vem de `useAuthStore`.

A maioria das rotas do dashboard passa dados iniciais vazios para templates. Os templates buscam dados em `useEffect` depois de ler o token no Zustand. Portanto, o app usa App Router para rotas/layout, mas o carregamento de dados é majoritariamente client-side.

## Fluxo de Loja

A home do dashboard é `src/app/(client-area)/dashboard/page.tsx`, que renderiza `HomeTemplate` em `src/components/templates/dashboard/home-template.tsx`.

`HomeTemplate` carrega a loja com `storeService.getMyStore(token)` de `src/services/resources/store-service.ts`, que chama `GET /store/me` -> `GET /api/v1/store/me`.

A criação de loja envia `StoreForm` de `src/components/molecules/store/store-form.tsx` e chama `storeService.createStore()` -> `POST /store` -> `POST /api/v1/store`.

A edição de loja chama `storeService.updateStore()` ou `storeService.updateStorePartial()` -> `PATCH /store/me` -> `PATCH /api/v1/store/me`.

O toggle aberto/fechado atualiza os horários do dia via `storeService.updateStorePartial()`. O service também expõe `toggleTodayOpen()`, mapeado para `PATCH /store/me/today-open` -> `PATCH /api/v1/store/me/today-open`.

## Produtos e Categorias

A rota de produtos é `src/app/(client-area)/dashboard/products/page.tsx`, que renderiza `ProductsTemplate` em `src/components/templates/dashboard/products-template.tsx`.

`ProductsTemplate` carrega produtos com `productService.list()` de `src/services/resources/product-service.ts`, chamando `GET /products` -> `GET /api/v1/products`. Ele envia paginação, busca, categoria e ordenação, e lê `X-Total-Count`.

Criação e edição usam `ProductForm` em `src/components/molecules/product/product-form.tsx`. O template chama:

- `productService.create()` -> `POST /products` -> `POST /api/v1/products`.
- `productService.update()` -> `PATCH /products/{productId}` -> `PATCH /api/v1/products/{product_id}`.
- `productService.remove()` -> `DELETE /products/{productId}` -> `DELETE /api/v1/products/{product_id}`.

Categorias são carregadas no formulário de produto com `categoryService.list()` -> `GET /categories` -> `GET /api/v1/categories`.

A rota de categorias é `src/app/(client-area)/dashboard/categories/page.tsx`, que renderiza `CategoriesTemplate` em `src/components/templates/dashboard/categories-template.tsx`. Ela usa `src/services/resources/category-service.ts`:

- `list()` -> `GET /categories` -> `GET /api/v1/categories`.
- `create()` -> `POST /categories` -> `POST /api/v1/categories`.
- `update()` -> `PATCH /categories/{categoryId}` -> `PATCH /api/v1/categories/{category_id}`.
- `remove()` -> `DELETE /categories/{categoryId}` -> `DELETE /api/v1/categories/{category_id}`.
- `reorder()` -> `POST /categories/reorder` -> `POST /api/v1/categories/reorder`.

## Clientes

A rota de clientes é `src/app/(client-area)/dashboard/customers/page.tsx`, renderizada por `CustomersTemplate` em `src/components/templates/dashboard/customers-template.tsx`.

`CustomersTemplate` usa `customerService` de `src/services/resources/customer-service.ts`:

- `list()` -> `GET /customers` -> `GET /api/v1/customers`.
- `create()` -> `POST /customers` -> `POST /api/v1/customers`.
- `update()` -> `PATCH /customers/{customerId}` -> `PATCH /api/v1/customers/{customer_id}`.
- `remove()` -> `DELETE /customers/{customerId}` -> `DELETE /api/v1/customers/{customer_id}`.

`OrdersTemplate` também usa `customerService.update()` quando um fluxo de WhatsApp precisa salvar ou corrigir o telefone do cliente.

## Formas de Pagamento e Entrega

Formas de pagamento são gerenciadas por `src/app/(client-area)/dashboard/payment-methods/page.tsx` e `src/components/templates/dashboard/payment-methods-template.tsx`, usando `src/services/resources/payment-method-service.ts`:

- `list()` -> `GET /payment-methods` -> `GET /api/v1/payment-methods`.
- `create()` -> `POST /payment-methods` -> `POST /api/v1/payment-methods`.
- `update()` -> `PATCH /payment-methods/{paymentMethodId}` -> `PATCH /api/v1/payment-methods/{payment_method_id}`.
- `remove()` -> `DELETE /payment-methods/{paymentMethodId}` -> `DELETE /api/v1/payment-methods/{payment_method_id}`.

Formas de entrega são gerenciadas por `src/app/(client-area)/dashboard/delivery-methods/page.tsx` e `src/components/templates/dashboard/delivery-methods-template.tsx`, usando `src/services/resources/delivery-method-service.ts`:

- `list()` -> `GET /delivery-methods` -> `GET /api/v1/delivery-methods`.
- `create()` -> `POST /delivery-methods` -> `POST /api/v1/delivery-methods`.
- `update()` -> `PATCH /delivery-methods/{deliveryMethodId}` -> `PATCH /api/v1/delivery-methods/{delivery_method_id}`.
- `remove()` -> `DELETE /delivery-methods/{deliveryMethodId}` -> `DELETE /api/v1/delivery-methods/{delivery_method_id}`.

Formas de entrega são usadas como bairros ou áreas durante checkout e criação de pedidos.

## Fluxo de Pedidos no Dashboard

A rota de pedidos é `src/app/(client-area)/dashboard/orders/page.tsx`, renderizada por `OrdersTemplate` em `src/components/templates/dashboard/orders-template.tsx`.

`OrdersTemplate` carrega pedidos com `orderService.list()` em `src/services/resources/order-service.ts`. Sem termo de busca, chama `GET /orders` -> `GET /api/v1/orders`; com busca, chama `GET /orders/search` -> `GET /api/v1/orders/search`. Envia `skip`, `limit`, `order_date` e `q`, e lê `X-Total-Count`.

Quando o modal de pedido abre, `OrdersTemplate` carrega produtos, formas de pagamento, formas de entrega, entregadores, WhatsApp da loja e slug da loja usando `productService`, `paymentMethodService`, `deliveryMethodService`, `courierService` e `storeService`.

O formulário é `OrderForm` em `src/components/molecules/order/order-form.tsx`. Ele valida com `orderFormSchema`, mapeia valores com `mapOrderFormToPayload()` de `src/schemas/forms.ts`, e calcula preview por `orderService.previewTotal()` -> `POST /orders/preview-total` -> `POST /api/v1/orders/preview-total`.

Salvar pedido chama:

- `orderService.create()` -> `POST /orders` -> `POST /api/v1/orders`.
- `orderService.update()` -> `PATCH /orders/{orderId}` -> `PATCH /api/v1/orders/{order_id}`.
- `orderService.remove()` -> `DELETE /orders/{orderId}` -> `DELETE /api/v1/orders/{order_id}`.
- `orderService.updateStatus()` -> `PUT /orders/{orderId}/status` -> `PUT /api/v1/orders/{order_id}/status`.

Mensagens de WhatsApp são criadas em `OrdersTemplate` com `buildOrderWhatsappMessage()` de `src/lib/order-whatsapp-message.ts` e helpers de telefone de `src/lib/phone.ts`.

## Fluxo do Catálogo Público

Rotas públicas do catálogo ficam em `src/app/catalog`.

- `src/app/catalog/[storeSlug]/page.tsx` renderiza `CatalogHomeTemplate`.
- `src/app/catalog/[storeSlug]/products/page.tsx` renderiza `CatalogProductsTemplate`.
- `src/app/catalog/[storeSlug]/category/[slug]/page.tsx` renderiza `CatalogProductsTemplate` em modo categoria.
- `src/app/catalog/[storeSlug]/product/[productSlug]/page.tsx` renderiza `CatalogProductTemplate`.
- `src/app/catalog/[storeSlug]/cart/page.tsx` renderiza `CatalogCartTemplate`.

O catálogo usa `catalogService` de `src/services/resources/catalog-service.ts`:

- `getHome()` -> `GET /catalog/{storeSlug}/home` -> `GET /api/v1/catalog/{store_slug}/home`.
- `getProducts()` -> `GET /catalog/{storeSlug}/products` -> `GET /api/v1/catalog/{store_slug}/products`.
- `getCategory()` -> `GET /catalog/{storeSlug}/categories/{slug}` -> `GET /api/v1/catalog/{store_slug}/categories/{category_slug}`.
- `getProduct()` -> `GET /catalog/{storeSlug}/products/{productSlug}` -> `GET /api/v1/catalog/{store_slug}/products/{product_slug}`.

`CatalogHomeTemplate`, `CatalogProductsTemplate` e `CatalogProductTemplate` recebem params das páginas App Router e carregam dados em `useEffect`. A busca tem debounce antes de recarregar.

`CatalogShell` em `src/components/organisms/catalog/catalog-shell.tsx` recebe dados públicos da loja e aplica identidade visual, navegação e estado aberto/fechado.

## Fluxo de Carrinho Público e Checkout

O estado do carrinho público fica em `useCatalogCartStore` de `src/store/catalog-cart-store.ts`, persistido como `pm-catalog-cart-store`.

Quando um cliente altera quantidade, `setQuantity()` atualiza estado local de forma otimista e sincroniza com o backend:

- Se não existe cart id, chama `catalogService.createCart()` -> `POST /catalog/{storeSlug}/carts` -> `POST /api/v1/catalog/{store_slug}/carts`.
- Se existe carrinho, chama `catalogService.replaceCartProducts()` -> `PUT /catalog/{storeSlug}/carts/{cartId}/products` -> `PUT /api/v1/catalog/{store_slug}/carts/{cart_id}/products`.
- Se o backend retorna `204`, o carrinho local é limpo.
- Se o backend rejeita a alteração, o estado local é revertido e um toast é exibido.

`CatalogCartTemplate` carrega dados de checkout:

- `catalogService.getHome()` para loja/catálogo.
- `catalogService.listPaymentMethods()` -> `GET /catalog/{storeSlug}/payment-methods`.
- `catalogService.listDeliveryMethods()` -> `GET /catalog/{storeSlug}/delivery-methods`.
- `catalogService.getCart()` -> `GET /catalog/{storeSlug}/carts/{cartId}`.

As etapas de checkout são: revisar carrinho, escolher pagamento/entrega, preencher dados do cliente e enviar.

Preview de total usa `catalogService.previewCartTotal()` -> `POST /catalog/{storeSlug}/carts/{cartId}/preview-total` -> `POST /api/v1/catalog/{store_slug}/carts/{cart_id}/preview-total`.

Checkout final usa `catalogService.checkoutCart()` -> `POST /catalog/{storeSlug}/carts/{cartId}/checkout` -> `POST /api/v1/catalog/{store_slug}/carts/{cart_id}/checkout`. Se a loja aceita encaminhar por WhatsApp e possui número válido, o frontend abre WhatsApp com uma mensagem de pedido gerada.

## Caixa

A rota de caixa é `src/app/(client-area)/dashboard/cash-register/page.tsx`, renderizada por `CashRegisterTemplate` em `src/components/templates/dashboard/cash-register-template.tsx`.

O service é `src/services/resources/cash-register-service.ts`:

- `getSummary()` -> `GET /cash-register/summary` -> `GET /api/v1/cash-register/summary`.
- `createEntry()` -> `POST /cash-register/entries` -> `POST /api/v1/cash-register/entries`.
- `updateEntry()` -> `PATCH /cash-register/entries/{entryId}` -> `PATCH /api/v1/cash-register/entries/{entry_id}`.
- `deleteEntry()` -> `DELETE /cash-register/entries/{entryId}` -> `DELETE /api/v1/cash-register/entries/{entry_id}`.

O template alterna períodos, seleciona datas, mostra receita automática de pedidos e gerencia entradas, despesas e retiradas de lucro manuais.

## Entregadores

A rota de entregadores é `src/app/(client-area)/dashboard/couriers/page.tsx`, renderizada por `CouriersTemplate` em `src/components/templates/dashboard/couriers-template.tsx`.

O service é `src/services/resources/courier-service.ts`:

- `list()` -> `GET /couriers` -> `GET /api/v1/couriers`.
- `create()` -> `POST /couriers` -> `POST /api/v1/couriers`.
- `update()` -> `PATCH /couriers/{courierId}` -> `PATCH /api/v1/couriers/{courier_id}`.
- `remove()` -> `DELETE /couriers/{courierId}` -> `DELETE /api/v1/couriers/{courier_id}`.
- `summary()` -> `GET /couriers/summary` -> `GET /api/v1/couriers/summary`.
- `addAdjustment()` -> `POST /couriers/adjustments` -> `POST /api/v1/couriers/adjustments`.
- `updateAdjustment()` -> `PATCH /couriers/adjustments/{adjustmentId}` -> `PATCH /api/v1/couriers/adjustments/{adjustment_id}`.
- `deleteAdjustment()` -> `DELETE /couriers/adjustments/{adjustmentId}` -> `DELETE /api/v1/couriers/adjustments/{adjustment_id}`.

Entregadores também são carregados por `OrdersTemplate` para associar pedidos de entrega a um entregador.

## Tratamento de Erros e Feedback de UI

Todas as chamadas ao backend passam por `createApiClient()` e `normalizeApiError()` em `src/services/http/client.ts`. Detalhes de validação do backend são traduzidos por `src/services/http/error-translator.ts`. Loadings e toasts são coordenados por `useUiFeedback()` em `src/hooks/use-ui-feedback.ts` e `useUiFeedbackStore` em `src/store/ui-feedback-store.ts`.

## Padrão Atual de Fluxo de Dados

O padrão atual é:

1. Um arquivo de rota em `src/app` renderiza um template.
2. O template lê o token de `useAuthStore` quando necessário.
3. O template chama um resource service de `src/services/resources`.
4. O service cria um client Axios e chama o endpoint backend.
5. O template salva a resposta em estado React local.
6. Mutations chamam um service, atualizam estado local e geralmente chamam `router.refresh()`.

Páginas públicas do catálogo seguem o mesmo padrão sem token de auth, usando params como `storeSlug` e `productSlug`.

