import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async processBarcodeScan(barkod: string, miktar: number) {
    // 1. Barkodun sistemdeki varyant karşılığını bul
    const barkodRecord = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { varyant: true },
    });

    if (!barkodRecord) {
      throw new NotFoundException(`${barkod} barkoduna ait varyant bulunamadı.`);
    }

    // 2. Atomik İşlem (Transaction)
    return this.prisma.$transaction(async (tx) => {
      // Stok miktarını güncelle (increment)
      const updatedVaryant = await tx.varyant.update({
        where: { id: barkodRecord.varyantId },
        data: { stokMiktari: { increment: miktar } },
      });

      // Sayım log kaydını oluştur
      const log = await tx.sayimKaydi.create({
        data: {
          varyantId: barkodRecord.varyantId,
          barkod: barkod,
          miktar: miktar,
          islemTipi: 'SAYIM',
        },
      });

      return {
        sku: updatedVaryant.sku,
        yeniStok: updatedVaryant.stokMiktari,
        islemZamani: log.kayitTarihi,
      };
    });
  }
}

