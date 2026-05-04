import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [ProductsModule, InventoryModule],
})
export class AppModule {}



