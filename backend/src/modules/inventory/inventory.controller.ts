import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Barkod okutulduğunda stok güncelleyen ana endpoint
  @Post('scan')
  @HttpCode(HttpStatus.OK)
  async scanBarcode(@Body() scanData: { barkod: string; miktar?: number }) {
    return this.inventoryService.processScan(scanData.barkod, scanData.miktar || 1);
  }

  // Belirli bir varyantın stok geçmişini (sayım loglarını) getirir
  @Get('history/:varyantId')
  async getHistory(@Param('varyantId') varyantId: string) {
    return this.inventoryService.getVaryantHistory(varyantId);
  }

  // Genel stok durum raporu (Kritik seviyedekiler vb.)
  @Get('report/summary')
  async getStockSummary() {
    return this.inventoryService.getStockSummary();
  }
}


