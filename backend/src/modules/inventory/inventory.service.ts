import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async processScan(barkod: string, miktar: number) {
    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { varyant: { include: { urun: true } } },
    });

    if (!barkodKaydi) {
      throw new NotFoundException(`Barkod bulunamadı: ${barkod}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const guncellenenVaryant = await tx.varyant.update({
        where: { id: barkodKaydi.varyantId },
        data: { stokMiktari: { increment: miktar } },
      });

      await tx.sayimKaydi.create({
        data: {
          varyantId: barkodKaydi.varyantId,
          barkod: barkod,
          miktar: miktar,
          islemTipi: 'SAYIM',
        },
      });

      return {
        sku: guncellenenVaryant.sku,
        yeniStok: guncellenenVaryant.stokMiktari,
      };
    });
  }

  // EKSİK OLAN METOD 1
  async getVaryantHistory(varyantId: string) {
    return this.prisma.sayimKaydi.findMany({
      where: { varyantId },
      orderBy: { kayitTarihi: 'desc' },
      take: 20,
    });
  }

  // EKSİK OLAN METOD 2
  async getStockSummary() {
    const summary = await this.prisma.varyant.aggregate({
      _sum: { stokMiktari: true },
      _count: { id: true },
    });

    return {
      toplamVaryantSayisi: summary._count.id,
      toplamStokAdedi: summary._sum.stokMiktari || 0,
    };
  }
}
