import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tratto Docs',
  description: 'Documentation for Tratto Email API and SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
