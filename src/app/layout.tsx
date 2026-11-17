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
  title: 'Sistem Optimasi Perencanaan Produksi - Metode Simpleks & Gauss-Jordan',
  description: 'Sistem optimasi alokasi sumber daya dan perencanaan produksi optimal berbasis web client-side, terintegrasi dengan implementasi C++ bebas error (opb.keidev.my.id).',
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
