# Perazzo Manager

Frontend for the Perazzo POS/commerce manager. It provides the store owner dashboard, product and category management, customer management, orders, payment methods, delivery methods, couriers, cash register views, authentication screens, and public catalog pages.

The application is built with Next.js App Router, React, TypeScript, Zustand, Tailwind CSS, and Axios.

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Zustand for client state
- Axios for API requests
- React Hook Form
- Zod and `@hookform/resolvers` for form validation
- Lucide React for icons
- react-colorful for color picking
- ESLint with Next.js configuration

## Project Structure

- `src/app`: Next.js routes, layouts, loading states, and API route handlers.
- `src/app/(client-area)/dashboard`: authenticated dashboard pages.
- `src/app/catalog`: public catalog pages.
- `src/components`: UI components organized with Atomic Design (`atoms`, `molecules`, `organisms`, `templates`).
- `src/services`: HTTP client and API resource services.
- `src/store`: Zustand stores.
- `src/types/api`: TypeScript types that mirror backend API entities.
- `src/i18n`: local dictionaries and translation provider.
- `src/lib`: shared helpers for sessions, phone formatting, colors, store hours, and WhatsApp messages.
- `src/schemas`: form schemas and validation.

## Environment Variables

Create a `.env.local` file in the project root.

When the backend is running locally with Docker Compose from `perazzo-api`, use:

```env
NEXT_PUBLIC_PERAZZO_API_URL=http://localhost:8001/api/v1
```

If this variable is not defined, the app defaults to:

- Development fallback: `http://localhost:8001/api/v1`
- Production: `https://perazzo-api.onrender.com/api/v1`

Using `.env.local` is recommended so the frontend points to the same local API port exposed by Docker.

## Install

Install dependencies:

```powershell
npm install
```

The repository also contains a `yarn.lock`, but the current project scripts work directly with npm. Prefer one package manager per install to avoid lockfile drift.

## Run Locally

Start the development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Make sure the backend API is running before using dashboard or catalog flows that need data:

```powershell
cd "C:\Users\Neto Perazzo\Documents\perazzo-api"
docker compose up --build -d
```

## Available Scripts

Run the development server:

```powershell
npm run dev
```

Create a production build:

```powershell
npm run build
```

Start the production server after building:

```powershell
npm run start
```

Run lint checks:

```powershell
npm run lint
```

Run TypeScript checks:

```powershell
npm run typecheck
```

## Main Routes

- `/login`: login page.
- `/register`: account creation page.
- `/forgot-password`: sends a password reset email through the backend SMTP flow and then shows an email-sent confirmation screen.
- `/reset-password`: opens from the email link, reads the reset token from the URL without displaying it, lets the user set a new password, and redirects to `/login`.
- `/dashboard`: store dashboard home.
- `/dashboard/products`: product management.
- `/dashboard/categories`: category management.
- `/dashboard/customers`: customer management.
- `/dashboard/orders`: order management.
- `/dashboard/payment-methods`: payment method management.
- `/dashboard/delivery-methods`: delivery method management.
- `/dashboard/couriers`: courier management.
- `/dashboard/cash-register`: cash register entries and period views.
- `/catalog`: public catalog entry point.
- `/catalog/[storeSlug]`: public store catalog.

## Backend Integration

This frontend consumes `perazzo-api`.

For local development with Docker:

- Backend API: `http://localhost:8001`
- Backend API v1: `http://localhost:8001/api/v1`
- Frontend: `http://localhost:3000`

Recommended local `.env.local`:

```env
NEXT_PUBLIC_PERAZZO_API_URL=http://localhost:8001/api/v1
```
