export interface Product {
  id: string;
  modelAdi: string; // Örn: Klasik Deri Kundura
  modelKodu: string; // Örn: KND-102
  marka?: string;    // Örn: Kale Kundura
  varyantlar: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  renk: string;
  beden: string;
  sku: string; // Örn: KND-102-SİYAH-42
  stokMiktari: number; // Depodaki tüm rafların toplam stok adedi
  barkodlar: ProductBarcode[];
  
  // Bu varyantın hangi raflarda, ne kadar miktarda bulunduğunun listesi
  konumStoklari?: ProductLocationStock[]; 
}

export interface ProductBarcode {
  id: string;
  barkod: string;
}

export interface ProductLocationStock {
  id: string;
  konumId: string;
  konumKodu: string; // Örn: REYON-A-SUTUN-3
  miktar: number;    // O rafta bulunan anlık çift sayısı
  isFull: boolean;   // O rafın kilitli/dolu olup olmadığı bilgisi
}

// GÜNCELLENDİ: Servis dosyasından buraya, ait olduğu yere taşındı!
export interface ProductPayload {
  barkod: string;
  urunAdi: string;
  marka?: string;
  renk: string;
  beden: string;
  sku: string;
  fiyat?: number;
}
