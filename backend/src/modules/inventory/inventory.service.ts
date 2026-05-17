import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ProductsService } from '../products/products.service';
import { ManualStockEntryDto } from './dto/manual-stock-entry.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  // 1. "Raf Doldu" Buton Tetikleyicisi
  async markShelfAsFull(konumId: string) {
    const konum = await this.prisma.depoKonum.findUnique({
      where: { id: konumId },
    });

    if (!konum) {
      throw new BadRequestException('Belirtilen raf konumu bulunamadı.');
    }

    return this.prisma.depoKonum.update({
      where: { id: konumId },
      data: { isFull: true },
    });
  }

  // 2. Akıllı Yer Önerisi (Mal Kabul esnasında el terminaline gösterilecek)
  async suggestLocationForBarcode(barkod: string) {
    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { varyant: true },
    });

    if (!barkodKaydi) {
      return {
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Barkod sistemde kayıtlı değil.',
      };
    }

    const { id: varyantId, beden } = barkodKaydi.varyant;

    // Kural: Beden birebir eşleşmeli ve "Raf Doldu" butonuna basılmamış (isFull: false) olmalı
    const uygunKonum = await this.prisma.depoKonum.findFirst({
      where: {
        tanimliBeden: beden,
        isFull: false,
      },
    });

    if (!uygunKonum) {
      throw new BadRequestException(
        `Depoda ${beden} numara için uygun veya boş bir raf alanı kalmadı!`,
      );
    }

    return {
      success: true,
      varyantId,
      onerilenKonumId: uygunKonum.id,
      onerilenKonumKodu: uygunKonum.konumKodu,
      checkDigit: uygunKonum.checkDigit,
    };
  }

  // 3. Barkod Okutma ve Rafa Miktar Bazlı Yerleştirme
  async processScan(barkod: string, miktar: number, konumId: string) {
    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { varyant: true },
    });

    if (!barkodKaydi) {
      return {
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Barkod sistemde kayıtlı değil.',
        barkod,
      };
    }

    // Hedef rafın kural kontrolü (Beden uyuyor mu ve dolu mu?)
    const hedefKonum = await this.prisma.depoKonum.findUnique({
      where: { id: konumId },
    });

    if (!hedefKonum) {
      throw new BadRequestException('Hedef raf konumu veritabanında bulunamadı.');
    }

    if (hedefKonum.isFull) {
      throw new BadRequestException('Bu raf doldu olarak işaretlenmiş, ürün yerleştirilemez!');
    }

    if (hedefKonum.tanimliBeden !== barkodKaydi.varyant.beden) {
      throw new BadRequestException(
        `Uyumsuz Raf! Bu raf sadece ${hedefKonum.tanimliBeden} numara için ayrılmıştır.`,
      );
    }

    // Stok işlemini ve sayım kaydını transaction ile miktar bazlı köprü tabloya işliyoruz
    return this.prisma.$transaction(async (tx) => {
      // Miktar bazlı raf_stoklari tablosu güncellemesi (Upsert)
      const rafStokKaydi = await tx.rafStok.upsert({
        where: {
          konumId_varyantId: {
            konumId: konumId,
            varyantId: barkodKaydi.varyantId,
          },
        },
        update: {
          miktar: { increment: miktar },
        },
        create: {
          konumId: konumId,
          varyantId: barkodKaydi.varyantId,
          miktar: miktar,
        },
      });

      // Sayım/Hareket kaydı oluştur
      await tx.sayimKaydi.create({
        data: {
          varyantId: barkodKaydi.varyantId,
          barkod,
          miktar,
          islemTipi: 'SAYIM',
        },
      });

      return {
        success: true,
        sku: barkodKaydi.varyant.sku,
        rafKonumu: hedefKonum.konumKodu,
        raftakiYeniStok: rafStokKaydi.miktar,
        varyantId: barkodKaydi.varyantId,
        islemTarihi: new Date(),
      };
    });
  }

  // 4. Barkod sistemde yoksa manuel ürün oluştur ve rafa yerleştir
  async manualStockEntry(dto: ManualStockEntryDto, konumId: string) {
    // Önce rafın uygunluğunu doğrula
    const hedefKonum = await this.prisma.depoKonum.findUnique({
      where: { id: konumId },
    });

    if (!hedefKonum) throw new BadRequestException('Seçilen raf konumu bulunamadı.');
    if (hedefKonum.isFull) throw new BadRequestException('Bu raf kilitli/dolu!');
    if (hedefKonum.tanimliBeden !== dto.beden) {
      throw new BadRequestException(`Bu rafa sadece ${hedefKonum.tanimliBeden} beden girebilir.`);
    }

    // Manuel varyant oluştur (Eski productsService'iniz kullanılmaya devam ediyor)
    const varyant = await this.productsService.createManualProduct({
      barkod: dto.barkod,
      urunAdi: dto.urunAdi,
      marka: dto.marka,
      renk: dto.renk,
      beden: dto.beden,
      sku: dto.sku,
      miktar: dto.miktar, 
    });

    return this.prisma.$transaction(async (tx) => {
      // Yeni varyantı miktar bazlı olarak ilgili rafa kaydediyoruz
      const rafStokKaydi = await tx.rafStok.upsert({
        where: {
          konumId_varyantId: {
            konumId: konumId,
            varyantId: varyant.id,
          },
        },
        update: {
          miktar: { increment: dto.miktar },
        },
        create: {
          konumId: konumId,
          varyantId: varyant.id,
          miktar: dto.miktar,
        },
      });

      // İlk stok hareket kaydı
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
        message: 'Manuel ürün kaydı oluşturuldu ve rafa yerleştirildi.',
        varyantId: varyant.id,
        sku: varyant.sku,
        rafKonumu: hedefKonum.konumKodu,
        raftakiStok: rafStokKaydi.miktar,
        islemTarihi: new Date(),
      };
    });
  }

  // 5. Son stok hareketleri (Dokunulmadı, aynen çalışıyor)
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

  // 6. Genel stok özeti (Artık varyant tablosundan değil rafStok tablosundan topluyor)
  async getStockSummary() {
    const summary = await this.prisma.rafStok.aggregate({
      _sum: {
        miktar: true,
      },
    });

    const toplamVaryantTipi = await this.prisma.varyant.count();

    return {
      toplamVaryantSayisi: toplamVaryantTipi,
      toplamStokAdedi: summary._sum.miktar || 0, // Tüm raflardaki fiziksel ayakkabı adeti toplamı
    };
  }
}
