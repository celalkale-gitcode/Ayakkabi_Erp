import { Module } from '@nestjs/common';
import { PrismaService } from './core/database/prisma.service';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [ProductsModule, InventoryModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService], // Prisma'yı diğer modüller de kullansın diye export ediyoruz
})
export class AppModule {}


