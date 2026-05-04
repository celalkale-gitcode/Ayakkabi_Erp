import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. API Sürümleme ve Ön Ek (Örn: localhost:3001/api/v1/inventory/scan)
  app.setGlobalPrefix('api/v1');

  // 2. Güvenlik: Frontend erişimine izin ver (CORS)
  app.enableCors();

  // 3. Otomatik Veri Doğrulama (DTO'lar için kritik)
  // Gelen veride DTO dışı alanları temizler ve tipleri otomatik dönüştürür
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // DTO'da olmayan alanları kabul etmez
      forbidNonWhitelisted: true, // DTO dışı alan gelirse hata döner
      transform: true,       // Gelen verileri (string->number) otomatik dönüştürür
    }),
  );

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  
  console.log(`🚀 ERP Backend Servis Çalışıyor: http://localhost:${PORT}/api/v1`);
}

bootstrap();

