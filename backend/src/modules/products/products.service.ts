import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Ürünü varyantları ve barkodları ile birlikte tek seferde oluşturur
  async createFullProduct(data: any) {
    const existing = await this.prisma.urun.findUnique({ where: { modelKodu: data.modelKodu } });
    if (existing) throw new ConflictException('Bu model kodu zaten kayıtlı.');

    return this.prisma.urun.create({
      data: {
        modelAdi: data.modelAdi,
        modelKodu: data.modelKodu,
        marka: data.marka,
        varyantlar: {
          create: data.varyantlar.map((v: any) => ({
            renk: v.renk,
            beden: v.beden,
            sku: v.sku,
            stokMiktari: v.stokMiktari || 0,
            barkodlar: {
              create: v.barkodlar.map((b: string) => ({ barkod: b }))
            }
          }))
        }
      },
      include: { varyantlar: { include: { barkodlar: true } } }
    });
  }

  async findAll() {
    return this.prisma.urun.findMany({ include: { varyantlar: true } });
  }
}

