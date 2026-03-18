# perazzo-manager

Frontend da área do cliente do Perazzo, construído com Next.js + React + Zustand + Tailwind.

## Stack

- Next.js (App Router)
- React + TypeScript
- Zustand (estado client)
- TailwindCSS
- i18n local (`pt-br`, `en`, `es`) com `pt-br` padrão

## Estrutura

- `src/app`: rotas, layouts e SSR
- `src/components`: Atomic Design (`atoms`, `molecules`, `organisms`, `templates`)
- `src/services`: consumo da `perazzo-api`
- `src/store`: stores Zustand
- `src/types/api`: tipagens baseadas no backend
- `src/i18n`: dicionários e provider de tradução

## Variáveis

Crie `.env.local`:

```bash
NEXT_PUBLIC_PERAZZO_API_URL=http://localhost:8000/api/v1
```

## Rodar

```bash
npm install
npm run dev
```

## Rotas da área cliente

- `/dashboard` (Home / Store)
- `/dashboard/products`
- `/dashboard/categories`
- `/dashboard/customers`
- `/dashboard/orders`
- `/dashboard/payment-methods`
