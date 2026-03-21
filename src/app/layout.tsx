import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'A-Track — Jewelry Workshop Management',
  description: 'Robuust, betrouwbaar, schoon order-tracking voor juweliers ateliers. Beheer bestellingen, volg productiestappen, en analyseer werkplaatsprestaties.',
  keywords: ['juwelier werkplaats', 'order tracking', 'productie beheer', 'atelier', 'goudsmid', 'jewelry workshop'],
  authors: [{ name: 'Atelier Systems' }],
  openGraph: {
    title: 'A-Track — Jewelry Workshop Management',
    description: 'Robuust, betrouwbaar, schoon order-tracking voor juweliers ateliers.',
    type: 'website',
    siteName: 'A-Track',
  },
  other: {
    'theme-color': '#0A0A0A',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
