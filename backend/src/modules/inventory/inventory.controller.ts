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
  constructor(private readonly inventoryService: InventoryService) {}

  // 1. Barkod okut ve seçilen rafa yerleştir
  @Post('scan')
  @HttpCode(HttpStatus.OK)
  async scanBarcode(@Body() scanData: ScanBarcodeDto) {
    // DTO'dan gelen verileri doğrudan servis iş mantığına gönderiyoruz
    return this.inventoryService.processScan(
      scanData.barkod,
      scanData.miktar || 1,
      scanData.konumId,
    );
  }

  // 2. Manuel ürün oluştur ve belirtilen rafa yerleştir
  @Post('manual-entry')
  @HttpCode(HttpStatus.CREATED)
  async manualEntry(@Body() dto: ManualStockEntryDto) {
    return this.inventoryService.manualStockEntry(dto, dto.konumId);
  }

  // 3. El terminalinden "Raf Doldu" butonuna basıldığında tetiklenir
  @Post('shelf-full')
  @HttpCode(HttpStatus.OK)
  async markShelfAsFull(@Body('konumId') konumId: string) {
    return this.inventoryService.markShelfAsFull(konumId);
  }

  // 4. El terminali ürün barkodunu okuttuğunda ona uygun boş raf önerir
  @Get('suggest/:barkod')
  async suggestLocation(@Param('barkod') barkod: string) {
    return this.inventoryService.suggestLocationForBarcode(barkod);
  }

  // 5. Varyant geçmişi (Sayım ve stok detayları için)
  @Get('history/:varyantId')
  async getHistory(@Param('varyantId') varyantId: string) {
    return this.inventoryService.getVaryantHistory(varyantId);
  }

  // 6. Genel stok özeti
  @Get('report/summary')
  async getStockSummary() {
    return this.inventoryService.getStockSummary();
  }
}
