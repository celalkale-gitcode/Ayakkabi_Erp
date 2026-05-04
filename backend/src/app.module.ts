import { Module } from '@nestjs/common';
import { PrismaService } from './core/database/prisma.service';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ProductsModule,  // Ürün ve Varyant yönetimi
    InventoryModule, // Stok ve Barkod işlemleri
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService], // Diğer modüllerin DB'ye erişebilmesi için export ediyoruz
})
export class AppModule {}



