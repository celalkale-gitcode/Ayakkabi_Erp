'use client';
import { useEffect, useState } from 'react';
import { productsApi } from '@/features/products/services/productsApi';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productsApi.getAll().then(setProducts);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ürün Listesi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p: any) => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-bold text-lg">{p.modelAdi}</h3>
            <p className="text-gray-500 text-sm">Kod: {p.modelKodu}</p>
            <div className="mt-2 border-t pt-2 text-sm text-gray-600">
              Varyant Sayısı: {p.varyantlar?.length || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

