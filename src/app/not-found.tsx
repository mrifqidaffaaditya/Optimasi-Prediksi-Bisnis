import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-bg text-ink">
      <h1 className="text-4xl font-extrabold text-accent">404</h1>
      <h2 className="mt-2 text-xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-sm text-ink-muted max-w-md">
        Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-surface shadow-subtle hover:bg-accent-hover transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
