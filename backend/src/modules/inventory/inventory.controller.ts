import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { InventoryService } from './inventory.service';

import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { ManualStockEntryDto } from './dto/manual-stock-entry.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  // Barkod okut
  @Post('scan')
  @HttpCode(HttpStatus.OK)
  async scanBarcode(
    @Body() scanData: ScanBarcodeDto,
  ) {
    return this.inventoryService.processScan(
      scanData.barkod,
      scanData.miktar || 1,
    );
  }

  // Manuel ürün girişi
  @Post('manual-entry')
  async manualEntry(
    @Body() dto: ManualStockEntryDto,
  ) {
    return this.inventoryService.manualStockEntry(dto);
  }

  // Varyant geçmişi
  @Get('history/:varyantId')
  async getHistory(
    @Param('varyantId') varyantId: string,
  ) {
    return this.inventoryService.getVaryantHistory(
      varyantId,
    );
  }

  // Stok özeti
  @Get('report/summary')
  async getStockSummary() {
    return this.inventoryService.getStockSummary();
  }
}
