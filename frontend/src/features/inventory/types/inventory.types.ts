export interface ScannedItem {
  success?: boolean;
  sku: string;
  barkod?: string;        // Alternatif erişimler için opsiyonel barkod alanı
  yeniStok: number;       // İşlem sonrası o rafa ait güncel stok miktarı
  miktar?: number;        // YENİ: Bu işlemde eklenen veya sayılan anlık adet
  konumKodu?: string;     // YENİ: İşlemin yapıldığı fiziksel raf kodu (Örn: REYON-A-SUTUN-3)
  islemTarihi?: string;
}

export interface ProductNotFoundResponse {
  success: false;
  code: 'PRODUCT_NOT_FOUND';
  message: string;
  barkod: string;
}

// YENİ: Backend'deki ManuelÜrünKartı oluşturma DTO'su ile tam uyumlu hale getirildi
export interface ManualProductPayload {
  barkod: string;
  konumId: string;        // YENİ: Manuel eklenen ürünün ilk yerleştirileceği zorunlu raf ID'si
  urunAdi: string;
  marka?: string;
  renk: string;
  beden: string;
  sku: string;
  miktar: number;         // İlk mal kabul miktarı
}

// YENİ: Akıllı Raf Önerisi endpoint'inden dönecek veri yapısı
export interface SuggestedLocationResponse {
  onerilenKonumId: string;
  onerilenKonumKodu: string;
  checkDigit: string;
  tanimliBeden?: string;
}

// YENİ: Aktif olarak işlem yapılan rafın yerel state yapısı
export interface ActiveLocationState {
  id: string;
  konumKodu: string;
  tanimliBeden: string;
  isFull: boolean;
}
