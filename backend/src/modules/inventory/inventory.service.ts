import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../core/database/prisma.service';

import { ProductsService } from '../products/products.service';

import { ManualStockEntryDto } from './dto/manual-stock-entry.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  // Barkod okutma
  async processScan(
    barkod: string,
    miktar: number,
  ) {

    const barkodKaydi =
      await this.prisma.urunBarkod.findUnique({
        where: {
          barkod,
        },

        include: {
          varyant: {
            include: {
              urun: true,
            },
          },
        },
      });

    // Barkod bulunamadı
    if (!barkodKaydi) {
      return {
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message:
          'Barkod sistemde kayıtlı değil.',
        barkod,
      };
    }

    // Stok artır
    return this.prisma.$transaction(
      async (tx) => {

        const guncellenenVaryant =
          await tx.varyant.update({
            where: {
              id: barkodKaydi.varyantId,
            },

            data: {
              stokMiktari: {
                increment: miktar,
              },
            },
          });

        // Sayım logu
        await tx.sayimKaydi.create({
          data: {
            varyantId:
              barkodKaydi.varyantId,

            barkod: barkod,

            miktar: miktar,

            islemTipi: 'SAYIM',
          },
        });

        return {
          success: true,
          sku: guncellenenVaryant.sku,
          yeniStok:
            guncellenenVaryant
              .stokMiktari,
        };
      },
    );
  }

  // Barkod sistemde yoksa manuel ürün oluştur
  async manualStockEntry(
    dto: ManualStockEntryDto,
  ) {

    const varyant =
      await this.productsService
        .createManualProduct({
          barkod: dto.barkod,
          urunAdi: dto.urunAdi,
          marka: dto.marka,
          renk: dto.renk,
          beden: dto.beden,
          sku: dto.sku,
          miktar: dto.miktar,
        });

    // İlk stok hareketi
    await this.prisma.sayimKaydi.create({
      data: {
        varyantId: varyant.id,
        barkod: dto.barkod,
        miktar: dto.miktar,
        islemTipi: 'MANUEL_GIRIS',
      },
    });

    return {
      success: true,
      message:
        'Manuel ürün kaydı oluşturuldu.',

      varyantId: varyant.id,
      sku: varyant.sku,
      stok: varyant.stokMiktari,
    };
  }

  // Varyant geçmişi
  async getVaryantHistory(
    varyantId: string,
  ) {

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

    const summary =
      await this.prisma.varyant.aggregate({
        _sum: {
          stokMiktari: true,
        },

        _count: {
          id: true,
        },
      });

    return {
      toplamVaryantSayisi:
        summary._count.id,

      toplamStokAdedi:
        summary._sum.stokMiktari || 0,
    };
  }
}
