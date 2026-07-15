import type { Metadata, Viewport } from 'next';
import './globals.css';
import Presence from './presence';

export const metadata: Metadata = {
  title: 'Mission Germany 🇩🇪',
  description: 'Packing checklist for RWTH Aachen — prices, best options, best time to buy',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // feels native inside the Capacitor wrapper
  themeColor: '#0f1115',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Presence />{children}</body>
    </html>
  );
}
