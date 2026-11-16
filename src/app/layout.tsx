import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Optimasi & Prediksi Bisnis - Perencanaan Alokasi Sumber Daya & Produksi',
  description: 'Aplikasi optimasi kombinasi produksi dan alokasi kapasitas sumber daya berbasis peramban (client-side), nyaman di ponsel, tanpa rumus rumit.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={ibmPlexSans.variable}>
      <body className="min-h-screen bg-bg text-ink antialiased selection:bg-accent-light selection:text-accent">
        {children}
      </body>
    </html>
  );
}
