import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../../core/database/prisma.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService], // İleride başka modüller ürün bilgilerine ihtiyaç duyarsa diye dışa açıyoruz.
})
export class ProductsModule {}

