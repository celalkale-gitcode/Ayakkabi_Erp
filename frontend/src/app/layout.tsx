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
    <html
      lang="tr"
      className="dark"
      suppressHydrationWarning
    >

      <head>

        {/* MATERIAL ICONS */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />

        {/* MOBILE VIEWPORT */}
        <meta
          name="viewport"
          content="
            width=device-width,
            initial-scale=1,
            maximum-scale=1,
            viewport-fit=cover
          "
        />

        {/* IOS WEB APP */}
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* THEME COLOR */}
        <meta
          name="theme-color"
          content="#121212"
        />

      </head>

      <body
        className={`
          ${inter.className}
          bg-[#121212]
          text-white
          antialiased
          overflow-x-hidden
          min-h-screen
        `}
      >

        {/* APP WRAPPER */}
        <div
          className="
            w-full
            min-h-screen
            bg-[#121212]
            text-white
          "
        >
          {children}
        </div>

      </body>

    </html>
  );
}
