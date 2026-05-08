import Link from 'next/link';

export default function DashboardPage() {

  return (

    <div className="min-h-screen p-6 bg-slate-50">

      <h1 className="text-3xl font-bold mb-8 text-center">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">

        {/* Ürünler */}
        <div className="bg-white p-6 rounded-2xl shadow border flex flex-col">

          <h2 className="text-xl font-bold mb-2">
            Ürünler
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Tüm ürünleri görüntüle
          </p>

          <Link
            href="/dashboard/products"
            className="mt-auto bg-blue-600 hover:bg-blue-700 transition text-white text-center py-3 rounded-xl font-medium"
          >
            Ürün Listesini Göster
          </Link>
        </div>

        {/* Stok Sayımı */}
        <div className="bg-white p-6 rounded-2xl shadow border flex flex-col">

          <h2 className="text-xl font-bold mb-2">
            Stok Sayımı
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Barkod ile stok güncelle
          </p>

          <Link
            href="/dashboard/inventory"
            className="mt-auto bg-green-600 hover:bg-green-700 transition text-white text-center py-3 rounded-xl font-medium"
          >
            Sayım Ekranını Aç
          </Link>
        </div>

      </div>
    </div>
  );
}
