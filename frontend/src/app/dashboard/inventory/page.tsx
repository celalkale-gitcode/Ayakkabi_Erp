'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  MoreVertical,
  QrCode,
  Loader2,
  X
} from 'lucide-react';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import InventoryTable from '@/features/inventory/components/InventoryTable';
import InventoryStats from '@/features/inventory/components/InventoryStats';
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';
import { toast } from 'react-hot-toast';

export default function InventoryPage() {
  const { 
    items, 
    loading: initialLoading, 
    stats, 
    updateStock, 
    fetchInventory 
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const handleScan = async (barcode: string) => {
    try {
      setLoading(true);
      // Barkod okunduğunda doğrudan işlemi yap
      await updateStock(barcode, 1, 'in');
      toast.success(`Stok güncellendi: ${barcode}`);
      await fetchInventory();
    } catch (error: any) {
      toast.error(error.message || 'Stok güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Envanter Yönetimi</h1>
          <p className="text-slate-500 text-sm">Ürün stoklarını ve hareketlerini izleyin.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <QrCode size={20} />
            <span className="font-medium">Hızlı Tarat</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Plus size={20} />
            <span className="font-medium">Yeni Ürün</span>
          </button>
        </div>
      </div>

      {/* STATS SECTION */}
      <InventoryStats stats={stats} />

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Ürün adı, barkod veya kategori ara..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            <Filter size={20} />
          </button>
          <select 
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-slate-600 focus:ring-2 focus:ring-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="sneaker">Sneaker</option>
            <option value="bot">Bot</option>
            <option value="klasik">Klasik</option>
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <InventoryTable 
          items={items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.barcode.includes(searchTerm)
          )} 
          loading={initialLoading} 
        />
      </div>

      {/* SCANNER MODAL */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowScanner(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg z-[101]"
            >
              {/* Kapatma Butonu Üstte Sağda */}
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-blue-200 transition-colors"
              >
                <span className="text-sm font-medium">Kapat</span>
                <X size={24} />
              </button>

              {/* Bizim Düzenlediğimiz Profesyonel Scanner Bileşeni */}
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
