import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { LocationModule } from './modules/location/location.module'; // YENİ EKLENDİ

@Module({
  imports: [
    ProductsModule, 
    InventoryModule, 
    LocationModule, // YENİ EKLENDİ: Konum ve Raf yönetim sistemi ana modüle bağlandı
  ],
})
export class AppModule {}
