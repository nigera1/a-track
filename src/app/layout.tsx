import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'A-Track — Jewelry Workshop Management',
  description: 'Precision production tracking for jewellery ateliers. Manage orders, track production stages, monitor deadlines, and analyse workshop performance.',
  keywords: ['jewelry workshop', 'order tracking', 'production management', 'atelier', 'goldsmith'],
  authors: [{ name: 'Atelier Systems' }],
  openGraph: {
    title: 'A-Track — Jewelry Workshop Management',
    description: 'Precision production tracking for jewellery ateliers.',
    type: 'website',
    siteName: 'A-Track',
  },
  other: {
    'theme-color': '#18181b',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* viewport: removed maximum-scale=1 — it blocks accessibility zoom (WCAG 1.4.4) */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* font-display=swap prevents invisible text during font load (FCP perf + accessibility) */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Skip navigation — WCAG 2.4.1: allows keyboard users to bypass repeated nav */}
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
