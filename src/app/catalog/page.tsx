import Link from "next/link";

export default function CatalogIndexPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 text-white">
      <h1 className="text-xl font-semibold">Catálogo</h1>
      <p className="mt-2 text-sm text-slate-300">
        Acesse usando o slug da loja. Exemplo: <span className="font-mono">/catalog/nome-da-loja</span>
      </p>
      <Link href="/login" className="mt-4 inline-block text-sm text-accent-400 underline">
        Ir para login
      </Link>
    </main>
  );
}
