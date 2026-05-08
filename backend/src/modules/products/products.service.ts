import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService }
  from '../../core/database/prisma.service';

import { CreateProductDto }
  from './dto/create-product.dto';

@Injectable()
export class ProductsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  // Normal ürün oluşturma
  async createFullProduct(
    dto: CreateProductDto,
  ) {

    // Model kodu kontrolü
    const existingModel =
      await this.prisma.urun.findUnique({

        where: {
          modelKodu:
            dto.modelKodu,
        },
      });

    if (existingModel) {

      throw new ConflictException(
        'Bu model kodu zaten mevcut.',
      );
    }

    // SKU duplicate kontrolü
    for (const varyant of dto.varyantlar) {

      const existingSku =
        await this.prisma.varyant.findUnique({

          where: {
            sku: varyant.sku,
          },
        });

      if (existingSku) {

        throw new ConflictException(
          `SKU zaten mevcut: ${varyant.sku}`,
        );
      }

      // Barkod duplicate kontrolü
      for (const barkod of varyant.barkodlar) {

        const existingBarcode =
          await this.prisma.urunBarkod.findUnique({

            where: {
              barkod,
            },
          });

        if (existingBarcode) {

          throw new ConflictException(
            `Barkod zaten mevcut: ${barkod}`,
          );
        }
      }
    }

    return this.prisma.urun.create({

      data: {

        modelAdi:
          dto.modelAdi,

        modelKodu:
          dto.modelKodu,

        marka:
          dto.marka,

        varyantlar: {

          create:
            dto.varyantlar.map(
              (v) => ({

                renk:
                  v.renk,

                beden:
                  v.beden,

                sku:
                  v.sku,

                stokMiktari:
                  v.stokMiktari || 0,

                barkodlar: {

                  create:
                    v.barkodlar.map(
                      (b) => ({
                        barkod: b,
                      }),
                    ),
                },
              }),
            ),
        },
      },

      include: {

        varyantlar: {

          include: {
            barkodlar: true,
          },
        },
      },
    });
  }

  // Barkod bulunamadığında manuel ürün oluştur
  async createManualProduct(data: {
    barkod: string;

    urunAdi: string;

    marka?: string;

    renk: string;

    beden: string;

    sku: string;

    miktar: number;
  }) {

    // SKU kontrolü
    const existingSku =
      await this.prisma.varyant.findUnique({

        where: {
          sku: data.sku,
        },
      });

    if (existingSku) {

      throw new ConflictException(
        'Bu SKU zaten mevcut.',
      );
    }

    // Barkod kontrolü
    const existingBarcode =
      await this.prisma.urunBarkod.findUnique({

        where: {
          barkod:
            data.barkod,
        },
      });

    // Barkod varsa direkt varyanta stok ekle
    if (existingBarcode) {

      const updatedVariant =
        await this.prisma.varyant.update({

          where: {
            id:
              existingBarcode.varyantId,
          },

          data: {

            stokMiktari: {

              increment:
                data.miktar,
            },
          },
        });

      return updatedVariant;
    }

    return this.prisma.$transaction(
      async (tx) => {

        // Manuel ürün oluştur
        const urun =
          await tx.urun.create({

            data: {

              modelAdi:
                data.urunAdi,

              modelKodu:
                `MANUAL-${Date.now()}`,

              marka:
                data.marka,
            },
          });

        // Manuel varyant oluştur
        const varyant =
          await tx.varyant.create({

            data: {

              urunId:
                urun.id,

              renk:
                data.renk,

              beden:
                data.beden,

              sku:
                data.sku,

              stokMiktari:
                data.miktar,
            },
          });

        // Barkod oluştur
        await tx.urunBarkod.create({

          data: {

            varyantId:
              varyant.id,

            barkod:
              data.barkod,
          },
        });

        // Son varyantı barkod ile birlikte dön
        return tx.varyant.findUnique({

          where: {
            id:
              varyant.id,
          },

          include: {
            barkodlar: true,
            urun: true,
          },
        });
      },
    );
  }

  // Tüm ürünleri getir
  async findAll() {

    return this.prisma.urun.findMany({

      include: {

        varyantlar: {

          include: {
            barkodlar: true,
          },
        },
      },

      orderBy: {
        kayitTarihi: 'desc',
      },
    });
  }

  // Tek ürün getir
  async findById(id: string) {

    const urun =
      await this.prisma.urun.findUnique({

        where: {
          id,
        },

        include: {

          varyantlar: {

            include: {
              barkodlar: true,
            },
          },
        },
      });

    if (!urun) {

      throw new NotFoundException(
        'Ürün bulunamadı.',
      );
    }

    return urun;
  }
}
