import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class ManualStockEntryDto {
  @IsString()
  @IsNotEmpty()
  barkod: string;

  @IsString()
  @IsNotEmpty()
  urunAdi: string;

  @IsOptional()
  @IsString()
  marka?: string;

  @IsString()
  @IsNotEmpty()
  renk: string;

  @IsString()
  @IsNotEmpty()
  beden: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @Min(1)
  miktar: number;

  // YENİ EKLENEN ALAN
  @IsString()
  @IsNotEmpty()
  konumId: string; // Manuel oluşturulan ürünün ilk yerleştirileceği rafın benzersiz ID'si
}
