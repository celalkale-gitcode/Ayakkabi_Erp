import {
  Injectable,
} from '@nestjs/common';

import { PrismaService }
  from '../../core/database/prisma.service';

import { ProductsService }
  from '../products/products.service';

import { ManualStockEntryDto }
  from './dto/manual-stock-entry.dto';

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

    // Barkod sistemde yok
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

        // Sayım kaydı oluştur
        await tx.sayimKaydi.create({

          data: {

            varyantId:
              barkodKaydi.varyantId,

            barkod,

            miktar,

            islemTipi: 'SAYIM',
          },
        });

        return {

          success: true,

          sku:
            guncellenenVaryant.sku,

          yeniStok:
            guncellenenVaryant
              .stokMiktari,

          varyantId:
            guncellenenVaryant.id,

          islemTarihi:
            new Date(),
        };
      },
    );
  }

  // Barkod sistemde yoksa manuel ürün oluştur
  async manualStockEntry(
    dto: ManualStockEntryDto,
  ) {

    // Manuel varyant oluştur
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

    // İlk stok hareket kaydı
    await this.prisma.sayimKaydi.create({

      data: {

        varyantId:
          varyant.id,

        barkod:
          dto.barkod,

        miktar:
          dto.miktar,

        islemTipi:
          'MANUEL_GIRIS',
      },
    });

    return {

      success: true,

      message:
        'Manuel ürün kaydı oluşturuldu.',

      varyantId:
        varyant.id,

      sku:
        varyant.sku,

      stok:
        varyant.stokMiktari,

      islemTarihi:
        new Date(),
    };
  }

  // Son stok hareketleri
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
