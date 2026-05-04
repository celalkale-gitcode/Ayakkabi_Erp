import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createFullProduct(dto: CreateProductDto) {
    const existing = await this.prisma.urun.findUnique({ where: { modelKodu: dto.modelKodu } });
    if (existing) throw new ConflictException('Bu model kodu zaten mevcut.');

    return this.prisma.urun.create({
      data: {
        modelAdi: dto.modelAdi,
        modelKodu: dto.modelKodu,
        marka: dto.marka,
        varyantlar: {
          create: dto.varyantlar.map(v => ({
            renk: v.renk,
            beden: v.beden,
            sku: v.sku,
            stokMiktari: v.stokMiktari || 0,
            barkodlar: { create: v.barkodlar.map(b => ({ barkod: b })) }
          }))
        }
      }
    });
  }

  async findAll() {
    return this.prisma.urun.findMany({ include: { varyantlar: true } });
  }
}
