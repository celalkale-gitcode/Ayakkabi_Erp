import type {
  Metadata,
} from 'next';

import {
  Inter,
} from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ayakkabı Stok ERP',

  description:
    'Barkodlu Ayakkabı Stok ve Sayım Sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="tr" className="dark">

      <body
        className={`${inter.className} bg-[#121212] text-white antialiased`}
      >
        {children}
      </body>

    </html>
  );
}
