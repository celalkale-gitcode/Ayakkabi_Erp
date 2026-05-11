import {
  ScannedItem,
} from '../types/inventory.types';

interface Props {
  items?: ScannedItem[];
}

export default function ScanHistoryList({
  items = [],
}: Props) {

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">

      <h2 className="font-bold text-slate-800 border-b pb-3 mb-3">
        Son Tarananlar
      </h2>

      <div className="space-y-3 max-h-60 overflow-y-auto">

        {items.length > 0 ? (

          items.map((item, idx) => (

            <div
              key={`${item.sku}-${idx}`}
              className="
                flex
                items-center
                justify-between
                p-3
                rounded-xl
                border
                bg-slate-50
                hover:bg-slate-100
                transition
              "
            >

              <div className="flex flex-col">

                <span className="font-bold text-sm text-slate-800">
                  {item.sku}
                </span>

                <span className="text-xs text-slate-500 mt-1">
                  {item.islemTarihi
                    ? new Date(
                        item.islemTarihi,
                      ).toLocaleTimeString(
                        'tr-TR',
                      )
                    : '-'}
                </span>

              </div>

              <span
                className="
                  bg-green-100
                  text-green-700
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-bold
                  whitespace-nowrap
                "
              >
                Stok: {item.yeniStok}
              </span>

            </div>

          ))

        ) : (

          <div
            className="
              text-center
              text-slate-400
              text-sm
              py-8
            "
          >
            Henüz barkod okutulmadı.
          </div>

        )}

      </div>
    </div>
  );
}
