import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class ManualStockEntryDto {
  @IsString()
  barkod: string;

  @IsString()
  urunAdi: string;

  @IsOptional()
  @IsString()
  marka?: string;

  @IsString()
  renk: string;

  @IsString()
  beden: string;

  @IsString()
  sku: string;

  @IsInt()
  @Min(1)
  miktar: number;
}
