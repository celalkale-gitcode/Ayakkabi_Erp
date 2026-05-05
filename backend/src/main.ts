import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Render'ın atadığı portu kullan, yerelde ise 3001'i kullan
  const port = process.env.PORT || 3001;

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }));

  // 2. '0.0.0.0' eklemek Render gibi bulut platformlarında dış erişim için zorunludur
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Uygulama şu portta çalışıyor: ${port}`);
}
bootstrap();

