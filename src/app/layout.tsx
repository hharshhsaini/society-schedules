import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FitVed | Vote Preferred Yoga Class Timings for Your Society',
  description:
    'Help FitVed schedule convenient yoga & wellness sessions tailored for your residential community in Bangalore. Vote for your preferred morning or evening timing slot.',
  keywords: [
    'FitVed',
    'Society Yoga',
    'Yoga Class Timings',
    'Bangalore Residential Yoga',
    'Community Wellness',
    'Sobha Dream Acres',
    'Prestige Lakeside Habitat',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-[#FAFAFC] text-slate-900 antialiased selection:bg-[#F5B400] selection:text-[#1D2550]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
