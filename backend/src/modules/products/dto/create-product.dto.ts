import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class VaryantDto {
  @IsString() @IsNotEmpty() renk: string;
  @IsString() @IsNotEmpty() beden: string;
  @IsString() @IsNotEmpty() sku: string;
  @IsInt() @Min(0) @IsOptional() stokMiktari?: number;
  @IsArray() @IsString({ each: true }) barkodlar: string[];
}

export class CreateProductDto {
  @IsString() @IsNotEmpty() modelAdi: string;
  @IsString() @IsNotEmpty() modelKodu: string;
  @IsString() @IsOptional() marka?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VaryantDto)
  varyantlar: VaryantDto[];
}

