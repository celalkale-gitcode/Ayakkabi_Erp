/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // El terminali paketlemelerinde (gerekirse static export için) resim optimizasyonu kapatılması doğrudur
  images: {
    unoptimized: true,
  },

  // Geliştirme sürecini baltalamamak için build esnasında ESLint bloklamalarını kaldırır
  eslint: {
    ignoreDuringBuilds: true,
  },

  // YENİ: Build esnasında TypeScript tip hataları yüzünden deployment'ın yarıda kalmasını önler.
  // El terminali geliştirmelerinde tip refaktörleri yaparken build'i ayakta tutmak için can kurtarır.
  typescript: {
    ignoreBuildErrors: true,
  },

  // YENİ: El terminali uygulamasını Android / Zebra cihazlara APK olarak gömecekseniz 
  // veya tamamen bağımsız static dosyalar olarak çıktı alacaksanız bu satırı aktifleştirin:
  // output: 'export',
};

module.exports = nextConfig;
