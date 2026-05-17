import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException, // YENİ EKLENDİ
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. Normal Ürün ve Varyant Kataloğu Oluşturma
  async createFullProduct(dto: CreateProductDto) {
    // Model kodu kontrolü
    const existingModel = await this.prisma.urun.findUnique({
      where: { modelKodu: dto.modelKodu },
    });

    if (existingModel) {
      throw new ConflictException('Bu model kodu zaten mevcut.');
    }

    // SKU ve Barkod mükerrerlik (duplicate) kontrolleri
    for (const varyant of dto.varyantlar) {
      const existingSku = await this.prisma.varyant.findUnique({
        where: { sku: varyant.sku },
      });

      if (existingSku) {
        throw new ConflictException(`SKU zaten mevcut: ${varyant.sku}`);
      }

      for (const barkod of varyant.barkodlar) {
        const existingBarcode = await this.prisma.urunBarkod.findUnique({
          where: { barkod },
        });

        if (existingBarcode) {
          throw new ConflictException(`Barkod zaten mevcut: ${barkod}`);
        }
      }
    }

    // Ürün kaydı (stokMiktari sütunu çıkartıldı)
    const yeniUrun = await this.prisma.urun.create({
      data: {
        modelAdi: dto.modelAdi,
        modelKodu: dto.modelKodu,
        marka: dto.marka,
        varyantlar: {
          create: dto.varyantlar.map((v) => ({
            renk: v.renk,
            beden: v.beden,
            sku: v.sku,
            // GÜNCELLENDİ: stokMiktari buradan tamamen kaldırıldı.
            barkodlar: {
              create: v.barkodlar.map((b) => ({
                barkod: b,
              })),
            },
          })),
        },
      },
      include: {
        varyantlar: {
          include: {
            barkodlar: true,
            rafStoklari: true, // Yeni miktar tablosunu dahil ediyoruz
          },
        },
      },
    });

    // Frontend uyumluluğu için sanal stokMiktari ekleyerek dönüyoruz
    return {
      ...yeniUrun,
      varyantlar: yeniUrun.varyantlar.map((v) => ({
        ...v,
        stokMiktari: 0, // Yeni açılan ürünün henüz raf stoğu yoktur
      })),
    };
  }

  // 2. Barkod bulunamadığında manuel ürün/varyant kartı açma
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
    const existingSku = await this.prisma.varyant.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictException('Bu SKU zaten mevcut.');
    }

    // Barkod kontrolü
    const existingBarcode = await this.prisma.urunBarkod.findUnique({
      where: { barkod: data.barkod },
    });

    // Barkod sistemde zaten varsa, sadece o varyant kartını bulup geri dönüyoruz.
    // GÜNCELLENDİ: Varyant tablosunda stok artırmak yerine, miktar lojiğini InventoryService rafa işleyecek.
    if (existingBarcode) {
      const mevcutVaryant = await this.prisma.varyant.findUnique({
        where: { id: existingBarcode.varyantId },
        include: {
          barkodlar: true,
          urun: true,
          rafStoklari: true,
        },
      });

      if (!mevcutVaryant) throw new NotFoundException('Varyant kaydı kırık, bulunamadı.');

      return {
        ...mevcutVaryant,
        stokMiktari: mevcutVaryant.rafStoklari.reduce((sum, item) => sum + item.miktar, 0),
      };
    }

    // Katalog kartı ilk kez oluşturuluyor (stokMiktari kaldırıldı)
    const yeniManuelVaryant = await this.prisma.$transaction(async (tx) => {
      const urun = await tx.urun.create({
        data: {
          modelAdi: data.urunAdi,
          modelKodu: `MANUAL-${Date.now()}`,
          marka: data.marka,
        },
      });

      const varyant = await tx.varyant.create({
        data: {
          urunId: urun.id,
          renk: data.renk,
          beden: data.beden,
          sku: data.sku,
          // GÜNCELLENDİ: stokMiktari kaldırıldı.
        },
      });

      await tx.urunBarkod.create({
        data: {
          varyantId: varyant.id,
          barkod: data.barkod,
        },
      });

      return tx.varyant.findUnique({
        where: { id: varyant.id },
        include: {
          barkodlar: true,
          urun: true,
          rafStoklari: true,
        },
      });
    });

    if (!yeniManuelVaryant) throw new BadRequestException('Manuel ürün kartı oluşturulamadı.');

    return {
      ...yeniManuelVaryant,
      stokMiktari: 0, // Gerçek miktar InventoryService tarafından rafa yazılacak
    };
  }

  // 3. Tüm ürünleri ve toplam raf stoklarını hesaplayarak getir
  async findAll() {
    const urunler = await this.prisma.urun.findMany({
      include: {
        varyantlar: {
          include: {
            barkodlar: true,
            rafStoklari: true, // Raflardaki adetleri çekiyoruz
          },
        },
      },
      orderBy: {
        kayitTarihi: 'desc',
      },
    });

    // GÜNCELLENDİ: Her varyantın tüm raflardaki stoğunu toplayıp tek bir sanal stokMiktari alanına map'liyoruz
    return urunler.map((urun) => ({
      ...urun,
      varyantlar: urun.varyantlar.map((v) => ({
        ...v,
        stokMiktari: v.rafStoklari.reduce((sum, item) => sum + item.miktar, 0),
      })),
    }));
  }

  // 4. Tek bir ürünü varyant toplam stoklarıyla getir
  async findById(id: string) {
    const urun = await this.prisma.urun.findUnique({
      where: { id },
      include: {
        varyantlar: {
          include: {
            barkodlar: true,
            rafStoklari: true,
          },
        },
      },
    });

    if (!urun) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    // GÜNCELLENDİ: Sanal stok hesabı ile frontend kırılmaları engellendi
    return {
      ...urun,
      varyantlar: urun.varyantlar.map((v) => ({
        ...v,
        stokMiktari: v.rafStoklari.reduce((sum, item) => sum + item.miktar, 0),
      })),
    };
  }
}
