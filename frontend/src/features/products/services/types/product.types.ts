export interface Product {
  id: string;

  modelAdi: string;

  modelKodu: string;

  marka?: string;

  varyantlar: ProductVariant[];
}

export interface ProductVariant {
  id: string;

  renk: string;

  beden: string;

  sku: string;

  stokMiktari: number;

  barkodlar: {
    id: string;
    barkod: string;
  }[];
}
