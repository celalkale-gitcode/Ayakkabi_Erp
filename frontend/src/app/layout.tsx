import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ayakkabı Stok ERP',
  description: 'Barkodlu Ayakkabı Stok ve Sayım Sistemi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ayakkabı ERP',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#121212',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark select-none" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body className={`${inter.className} bg-[#121212] text-white antialiased overflow-x-hidden overscroll-behavior-y-none min-h-screen`}>
        <div className="w-full min-h-[100dvh] h-full bg-[#121212] text-white flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
