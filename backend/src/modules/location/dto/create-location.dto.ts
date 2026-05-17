import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  konumKodu: string; // Örnek: REYON-A-SUTUN-3-KAT-2

  @IsString()
  @IsNotEmpty()
  depoId: string;

  @IsString()
  @IsNotEmpty()
  alan: string; // Örnek: "Spor Ayakkabı Alanı"

  @IsString()
  @IsNotEmpty()
  reyon: string; // Örnek: "A"

  @IsInt()
  @Min(1)
  sutun: number; // Örnek: 3

  @IsInt()
  @Min(1)
  kat: number; // Örnek: 2

  @IsInt()
  @Min(1)
  goz: number; // Örnek: 1

  @IsString()
  @IsNotEmpty()
  checkDigit: string; // Örnek: "45" (Barkod doğrulama kodu)

  @IsString()
  @IsNotEmpty()
  tanimliBeden: string; // Örnek: "42" (Bu rafa sadece 42 numara girebilir)
}
