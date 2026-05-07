import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../core/database/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // Normal ürün oluşturma
  async createFullProduct(
    dto: CreateProductDto,
  ) {

    const existing =
      await this.prisma.urun.findUnique({
        where: {
          modelKodu: dto.modelKodu,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Bu model kodu zaten mevcut.',
      );
    }

    return this.prisma.urun.create({
      data: {
        modelAdi: dto.modelAdi,
        modelKodu: dto.modelKodu,
        marka: dto.marka,

        varyantlar: {
          create: dto.varyantlar.map((v) => ({
            renk: v.renk,
            beden: v.beden,
            sku: v.sku,

            stokMiktari:
              v.stokMiktari || 0,

            barkodlar: {
              create: v.barkodlar.map(
                (b) => ({
                  barkod: b,
                }),
              ),
            },
          })),
        },
      },
    });
  }

  // Barkod bulunamadığında manuel ürün oluşturma
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
          barkod: data.barkod,
        },
      });

    if (existingBarcode) {
      throw new ConflictException(
        'Bu barkod zaten kayıtlı.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {

        // Ürün oluştur
        const urun =
          await tx.urun.create({
            data: {
              modelAdi: data.urunAdi,

              modelKodu:
                `MANUAL-${Date.now()}`,

              marka: data.marka,
            },
          });

        // Varyant oluştur
        const varyant =
          await tx.varyant.create({
            data: {
              urunId: urun.id,
              renk: data.renk,
              beden: data.beden,
              sku: data.sku,
              stokMiktari: data.miktar,
            },
          });

        // Barkod oluştur
        await tx.urunBarkod.create({
          data: {
            varyantId: varyant.id,
            barkod: data.barkod,
          },
        });

        return varyant;
      },
    );
  }

  // Ürün listeleme
  async findAll() {
    return this.prisma.urun.findMany({
      include: {
        varyantlar: {
          include: {
            barkodlar: true,
          },
        },
      },
    });
  }
}
