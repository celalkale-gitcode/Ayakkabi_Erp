import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class ScanBarcodeDto {
  @IsString()
  @IsNotEmpty()
  barkod: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  miktar?: number = 1;

  // YENİ EKLENEN ALAN
  @IsString()
  @IsNotEmpty()
  konumId: string; // Ürünün okutulduğu / yerleştirildiği rafın benzersiz ID'si
}
