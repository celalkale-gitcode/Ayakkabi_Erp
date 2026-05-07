import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../core/database/prisma.service';

import { ManualStockEntryDto } from './dto/manual-stock-entry.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Barkod okutma işlemi
  async processScan(barkod: string, miktar: number) {
    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: {
        varyant: {
          include: {
            urun: true,
          },
        },
      },
    });

    // Barkod sistemde yoksa
    if (!barkodKaydi) {
      return {
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Barkod sistemde kayıtlı değil.',
        barkod,
      };
    }

    // Barkod bulunduysa stok artır
    return this.prisma.$transaction(async (tx) => {
      const guncellenenVaryant = await tx.varyant.update({
        where: {
          id: barkodKaydi.varyantId,
        },
        data: {
          stokMiktari: {
            increment: miktar,
          },
        },
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
        success: true,
        sku: guncellenenVaryant.sku,
        yeniStok: guncellenenVaryant.stokMiktari,
      };
    });
  }

  // Manuel ürün + stok girişi
  async manualStockEntry(dto: ManualStockEntryDto) {
    return this.prisma.$transaction(async (tx) => {

      // SKU kontrolü
      const existingSku = await tx.varyant.findUnique({
        where: {
          sku: dto.sku,
        },
      });

      if (existingSku) {
        throw new ConflictException('Bu SKU zaten mevcut.');
      }

      // Barkod kontrolü
      const existingBarcode = await tx.urunBarkod.findUnique({
        where: {
          barkod: dto.barkod,
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Bu barkod zaten kayıtlı.');
      }

      // Ürün oluştur
      const urun = await tx.urun.create({
        data: {
          modelAdi: dto.urunAdi,
          modelKodu: `MANUAL-${Date.now()}`,
          marka: dto.marka,
        },
      });

      // Varyant oluştur
      const varyant = await tx.varyant.create({
        data: {
          urunId: urun.id,
          renk: dto.renk,
          beden: dto.beden,
          sku: dto.sku,
          stokMiktari: dto.miktar,
        },
      });

      // Barkod oluştur
      await tx.urunBarkod.create({
        data: {
          varyantId: varyant.id,
          barkod: dto.barkod,
        },
      });

      // İlk stok hareketi
      await tx.sayimKaydi.create({
        data: {
          varyantId: varyant.id,
          barkod: dto.barkod,
          miktar: dto.miktar,
          islemTipi: 'MANUEL_GIRIS',
        },
      });

      return {
        success: true,
        message: 'Manuel ürün kaydı oluşturuldu.',
        varyantId: varyant.id,
        sku: varyant.sku,
        stok: varyant.stokMiktari,
      };
    });
  }

  // Varyant geçmişi
  async getVaryantHistory(varyantId: string) {
    return this.prisma.sayimKaydi.findMany({
      where: {
        varyantId,
      },
      orderBy: {
        kayitTarihi: 'desc',
      },
      take: 20,
    });
  }

  // Genel stok özeti
  async getStockSummary() {
    const summary = await this.prisma.varyant.aggregate({
      _sum: {
        stokMiktari: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      toplamVaryantSayisi: summary._count.id,
      toplamStokAdedi: summary._sum.stokMiktari || 0,
    };
  }
}
