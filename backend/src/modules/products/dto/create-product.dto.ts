import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VaryantDto {
  @IsString() 
  @IsNotEmpty() 
  renk: string;

  @IsString() 
  @IsNotEmpty() 
  beden: string;

  @IsString() 
  @IsNotEmpty() 
  sku: string;

  // GÜNCELLENDİ: @IsInt() stokMiktari alanı buradan tamamen kaldırıldı.

  @IsArray() 
  @IsString({ each: true }) 
  barkodlar: string[];
}

export class CreateProductDto {
  @IsString() 
  @IsNotEmpty() 
  modelAdi: string;

  @IsString() 
  @IsNotEmpty() 
  modelKodu: string;

  @IsString() 
  @IsOptional() 
  marka?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VaryantDto)
  varyantlar: VaryantDto[];
}
