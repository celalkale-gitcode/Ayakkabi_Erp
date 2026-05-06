import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ayakkabı Stok ERP",
  description: "Barkodlu Ayakkabı Stok ve Sayım Sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="min-h-screen flex flex-col">

          <header className="bg-white border-b p-4 shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="font-bold text-xl">👟 AYAKKABI ERP</h1>

              <nav className="space-x-4">
                <a href="/dashboard/products">Ürünler</a>
                <a href="/dashboard/inventory">Sayım</a>
              </nav>
            </div>
          </header>

          <main className="flex-grow container mx-auto py-6">
            {children}
          </main>

          <footer className="bg-white border-t p-4 text-center text-sm text-slate-500">
            © 2024 ERP System
          </footer>

        </div>
      </body>
    </html>
  );
}
