'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  QrCode,
  X,
  Package,
  List
} from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts'; // Mevcut hook'un
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';
import ProductTable from '@/features/products/components/ProductTable';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const { products, loading: initialLoading, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // BARKOD TARAMA SONUCU
  const handleScan = async (barcode: string) => {
    // Sayfa içinde ekstra bir "İşleniyor" yazısına gerek yok, 
    // BarcodeScanner bileşeni bunu kendi içinde hallediyor.
    try {
      // Örnek: Barkodla ürün arama veya detay getirme işlemi
      toast.success(`Ürün bulundu: ${barcode}`);
      // Buraya barkodla ilgili yapmak istediğin mantığı ekleyebilirsin
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* ÜST BAŞLIK VE BUTONLAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" /> Ürün Portföyü
          </h1>
          <p className="text-slate-500 text-sm">Sistemdeki tüm ayakkabı modellerini yönetin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            <QrCode size={18} />
            <span className="font-semibold text-sm">Barkod Tara</span>
          </button>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus size={18} />
            <span className="font-semibold text-sm">Yeni Ekle</span>
          </button>
        </div>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Model adı veya barkod ile hızlı ara..."
          className="flex-1 p-3 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLO BÖLÜMÜ */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <ProductTable 
          products={products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))} 
          loading={initialLoading} 
        />
      </div>

      {/* TARAYICI MODALI (SADECE BİZİM PROFESYONEL SCANNER) */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setShowScanner(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm"
            >
              {/* Kapatma butonu - Tarayıcının hemen üstünde */}
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute -top-12 right-0 flex items-center gap-2 text-white/80 hover:text-white"
              >
                <span className="text-sm font-bold uppercase tracking-widest">Kapat</span>
                <X size={24} />
              </button>

              {/* Bizim tasarladığımız BarcodeScanner bileşeni */}
              <BarcodeScanner 
                onResult={handleScan}
                onClose={() => setShowScanner(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
