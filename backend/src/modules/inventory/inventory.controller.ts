import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  async scanBarcode(@Body() body: { barkod: string; miktar?: number }) {
    return this.inventoryService.processBarcodeScan(body.barkod, body.miktar || 1);
  }
}

