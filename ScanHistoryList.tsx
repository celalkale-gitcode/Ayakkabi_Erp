import {
  ScannedItem,
} from '../types/inventory.types';

interface Props {
  items: ScannedItem[];
}

export default function ScanHistoryList({
  items,
}: Props) {

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">

      <h2 className="font-semibold border-b pb-2 mb-3">
        Son Sayımlar
      </h2>

      <div className="space-y-3 max-h-60 overflow-y-auto">

        {items.map((item, idx) => (

          <div
            key={item.sku + idx}
            className="flex justify-between items-center p-2 bg-slate-50 rounded border"
          >

            <div>
              <p className="font-bold text-sm">
                {item.sku}
              </p>

              <p className="text-xs text-gray-500">
                {item.islemTarihi
                  ? new Date(
                      item.islemTarihi,
                    ).toLocaleTimeString()
                  : '-'}
              </p>
            </div>

            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
              Stok: {item.yeniStok}
            </span>

          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            Henüz barkod okutulmadı.
          </p>
        )}
      </div>
    </div>
  );
}
