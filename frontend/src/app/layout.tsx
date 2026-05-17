import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
});

// 1. GÜNCELLENDİ: Tüm mobil cihaz ve iOS web uygulaması ayarları modern Next.js standartına taşındı
export const metadata: Metadata = {
  title: 'Ayakkabı Stok ERP',
  description: 'Barkodlu Ayakkabı Stok ve Sayım Sistemi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ayakkabı ERP',
  },
};

// 2. YENİ: Viewport ayarları Next.js 14+ standartlarına göre ayrı bir export olarak tanımlandı
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewport-fit: 'cover',
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className="dark select-none" // El terminalinde personelin metinleri kazara seçip maviye boyamasını engeller
      suppressHydrationWarning
    >
      <head>
        {/* MATERIAL ICONS (Harici fontlar veya kütüphaneler için head içi uygundur) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>

      <body
        className={`
          ${inter.className}
          bg-[#121212]
          text-white
          antialiased
          overflow-x-hidden
          overscroll-behavior-y-none 
          min-h-screen
        `}
        /* overscroll-behavior-y-none: Sayfayı yukarı/aşağı çekerken tarayıcının yaylanmasını (bounce) engeller */
      >
        {/* APP WRAPPER */}
        {/* h-[100dvh]: El terminalinde klavye açıldığında tasarımın yukarı doğru pörsümesini engeller */}
        <div className="w-full min-h-[100dvh] h-full bg-[#121212] text-white flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
} 
