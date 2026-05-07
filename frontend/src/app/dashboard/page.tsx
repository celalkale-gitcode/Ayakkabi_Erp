import Link from 'next/link';

export default function DashboardPage() {

  return (
    <div className="min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-6 text-center">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">

        <Link
          href="/dashboard/products"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border text-center"
        >

          <h2 className="text-lg font-semibold mb-2">
            Ürünler
          </h2>

          <p className="text-sm text-gray-500">
            Tüm ürünleri görüntüle
          </p>

        </Link>

        <Link
          href="/dashboard/inventory"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border text-center"
        >

          <h2 className="text-lg font-semibold mb-2">
            Stok Sayımı
          </h2>

          <p className="text-sm text-gray-500">
            Barkod ile stok güncelle
          </p>

        </Link>

      </div>
    </div>
  );
}
