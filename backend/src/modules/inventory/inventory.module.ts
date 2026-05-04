import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaService } from '../../core/database/prisma.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, PrismaService],
})
export class InventoryModule {}


