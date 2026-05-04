import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async processScan(barkod: string, miktar: number) {
    // 1. Önce barkodun hangi varyanta ait olduğunu buluyoruz
    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { 
        varyant: { 
          include: { urun: true } // Ürün ismini de göstermek için
        } 
      },
    });

    if (!barkodKaydi) {
      throw new NotFoundException(`Sistemde ${barkod} barkodlu bir ürün bulunamadı.`);
    }

    // 2. Transaction: Stok artırımı ve Log kaydı eşzamanlı yapılır
    return this.prisma.$transaction(async (tx) => {
      // Stok miktarını güncelle
      const guncellenenVaryant = await tx.varyant.update({
        where: { id: barkodKaydi.varyantId },
        data: { stokMiktari: { increment: miktar } },
      });

      // Sayım logunu oluştur
      const log = await tx.sayimKaydi.create({
        data: {
          varyantId: barkodKaydi.varyantId,
          barkod: barkod,
          miktar: miktar,
          islemTipi: 'SAYIM',
        },
      });

      return {
        mesaj: "Stok başarıyla güncellendi",
        urun: barkodKaydi.varyant.urun.modelAdi,
        sku: guncellenenVaryant.sku,
        yeniStok: guncellenenVaryant.stokMiktari,
        islemTarihi: log.kayitTarihi
      };
    });
  }

  async getVaryantHistory(varyantId: string) {
    return this.prisma.sayimKaydi.findMany({
      where: { varyantId },
      orderBy: { kayitTarihi: 'desc' },
      take: 20 // Son 20 hareket
    });
  }

  async getStockSummary() {
    // Toplam kaç çeşit ayakkabı (varyant) var ve toplam adet ne?
    const summary = await this.prisma.varyant.aggregate({
      _sum: { stokMiktari: true },
      _count: { id: true }
    });
    
    return {
      toplamVaryantSayisi: summary._count.id,
      toplamStokAdedi: summary._sum.stokMiktari || 0
    };
  }
}
