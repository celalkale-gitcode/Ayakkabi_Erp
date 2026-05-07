export interface ScannedItem {
  success?: boolean;

  sku: string;

  yeniStok: number;

  islemTarihi?: string;
}

export interface ProductNotFoundResponse {
  success: false;

  code: 'PRODUCT_NOT_FOUND';

  message: string;

  barkod: string;
}

export interface ManualProductPayload {
  barkod: string;

  urunAdi: string;

  marka?: string;

  renk: string;

  beden: string;

  sku: string;

  miktar: number;
}
