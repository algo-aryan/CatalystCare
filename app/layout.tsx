import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CatalystCare — Intelligent Elderly Care & Medication Management',
  description: 'Proactive, accessible healthcare platform connecting elderly individuals, caretakers, and family members.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-200">
        {children}
      </body>
    </html>
  );
}
