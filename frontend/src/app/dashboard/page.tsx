import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 bg-zinc-950 text-zinc-100 antialiased flex flex-col justify-center">
      <div className="max-w-4xl w-full mx-auto space-y-10">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent uppercase">
            Ayakkabı Envanter ERP
          </h1>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
            Merkezi Kontrol ve Sayım Sistemi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* 1. KART: Web Envanter Yönetimi */}
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-2xl flex flex-col justify-between hover:border-zinc-700/80 transition duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold tracking-wide text-zinc-200">Merkezi Envanter</h2>
                <span className="material-icons text-zinc-600 group-hover:text-zinc-400 transition">inventory_2</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Tüm ayakkabı modellerini, renk/beden varyantlarını ve depodaki detaylı raf/hücre dağılımlarını listeleyin.
              </p>
            </div>
            <Link href="/dashboard/products" className="mt-auto bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 transition-all text-zinc-200 text-center py-3 rounded-xl text-xs font-bold font-mono tracking-wider uppercase shadow-md">
              Ürün Listesini Göster
            </Link>
          </div>

          {/* 2. KART: El Terminali Sayım Ekranı */}
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-2xl flex flex-col justify-between hover:border-zinc-700/80 transition duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold tracking-wide text-zinc-200">Mobil Stok Operasyonu</h2>
                <span className="material-icons text-zinc-600 group-hover:text-emerald-500 transition">qr_code_scanner</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                El terminali veya mobil cihazlar üzerinden canlı raf ve ürün barkodu okutarak anlık miktar girişi ve sayım yapın.
              </p>
            </div>
            <Link href="/dashboard/inventory" className="mt-auto bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-900/40 text-emerald-400 text-center py-3 rounded-xl text-xs font-bold font-mono tracking-wider uppercase shadow-md transition-all">
              Sayım Ekranını Aç
            </Link>
          </div>

        </div>

        <div className="text-center">
          <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-900">
            v3.2.0 — Safe Mode Active
          </span>
        </div>

      </div>
    </div>
  );
}
