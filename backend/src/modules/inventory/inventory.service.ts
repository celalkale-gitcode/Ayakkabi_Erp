import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ProductsService } from '../products/products.service';
import { ManualStockEntryDto } from './dto/manual-stock-entry.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  /**
   * 1. "Raf Doldu" Buton Tetikleyicisi
   * Terminalden gelen ham konumKodu (String) değerini UUID'ye dönüştürerek işlem yapar.
   */
  async markShelfAsFull(konumIdOrKodu: string) {
    const cleanKonum = konumIdOrKodu.trim().toUpperCase();

    // Benzersiz konum_kodu veya id üzerinden rafı buluyoruz
    const konum = await this.prisma.depoKonum.findFirst({
      where: {
        OR: [
          { id: cleanKonum.toLowerCase().length === 36 ? cleanKonum : undefined }, // Geçerli bir UUID ise
          { konumKodu: cleanKonum }
        ]
      }
    });

    if (!konum) {
      throw new BadRequestException(`Belirtilen raf konumu (${cleanKonum}) bulunamadı.`);
    }

    return this.prisma.depoKonum.update({
      where: { id: konum.id },
      data: { isFull: true },
    });
  }

  /**
   * 2. Akıllı Yer Önerisi (Mal Kabul esnasında el terminaline gösterilecek)
   */
  async suggestLocationForBarcode(barkod: string) {
    const cleanBarcode = barkod.trim().toUpperCase();

    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod: cleanBarcode },
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
      orderBy: { kayitTarihi: 'asc' }, // İlk açılan/en eski rafa yönlendir
    });

    if (!uygunKonum) {
      throw new BadRequestException(
        `Depoda ${beden} numara için uygun veya kilitlenmemiş boş bir raf alanı kalmadı!`,
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

  /**
   * 3. Barkod Okutma ve Rafa Miktar Bazlı Yerleştirme (HAYATİ METOT)
   * `konumIdOrKodu` parametresi terminalden string gelse bile veritabanını patlatmaz.
   */
  async processScan(barkod: string, miktar: number, konumIdOrKodu: string) {
    const cleanBarcode = barkod.trim().toUpperCase();
    const cleanKonum = konumIdOrKodu.trim().toUpperCase();
    const numericQuantity = parseInt(miktar.toString(), 10) || 1;

    // A- Ürün barkodunu doğrula
    const barkodKaydi = await this.prisma.urunBarkod.findUnique({
      where: { barkod: cleanBarcode },
      include: { varyant: true },
    });

    if (!barkodKaydi) {
      return {
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Barkod sistemde kayıtlı değil.',
        barkod: cleanBarcode,
      };
    }

    // B- Hedef rafı akıllıca bul (UUID veya String Konum Kodu uyumluluğu)
    const hedefKonum = await this.prisma.depoKonum.findFirst({
      where: {
        OR: [
          { id: cleanKonum.toLowerCase().length === 36 ? cleanKonum : undefined },
          { konumKodu: cleanKonum }
        ]
      }
    });

    if (!hedefKonum) {
      throw new BadRequestException(`Hedef raf konumu (${cleanKonum}) veritabanında bulunamadı.`);
    }

    if (hedefKonum.isFull) {
      throw new BadRequestException('Bu raf "Doldu" olarak işaretlenmiş, yeni ürün yerleştirilemez!');
    }

    // C- Beden Doğrulama Güvenlik Duvarı
    if (hedefKonum.tanimliBeden !== barkodKaydi.varyant.beden) {
      throw new BadRequestException(
        `Uyumsuz Raf! Bu raf sadece ${hedefKonum.tanimliBeden} numara için ayrılmıştır. Okutulan Ürün: ${barkodKaydi.varyant.beden}`,
      );
    }

    // D- Veri bütünlüğü için ACID Transaction başlatıyoruz
    return this.prisma.$transaction(async (tx) => {
      // Köprü tablo güncellemesi (Upsert) - Gerçek UUID'ler kilitlendi
      const rafStokKaydi = await tx.rafStok.upsert({
        where: {
          konumId_varyantId: {
            konumId: hedefKonum.id,
            varyantId: barkodKaydi.varyantId,
          },
        },
        update: {
          miktar: { increment: numericQuantity },
        },
        create: {
          konumId: hedefKonum.id,
          varyantId: barkodKaydi.varyantId,
          miktar: numericQuantity,
        },
      });

      // GÜNCELLEME: Yeni SQL şemasındaki konumId (FK) bağını ekleyerek sayım kaydını oluşturuyoruz
      await tx.sayimKaydi.create({
        data: {
          varyantId: barkodKaydi.varyantId,
          konumId: hedefKonum.id, // Son eklediğimiz ilişkisel kolon dolduruldu
          barkod: cleanBarcode,
          miktar: numericQuantity,
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

  /**
   * 4. Barkod sistemde yoksa manuel ürün oluştur ve rafa yerleştir
   */
  async manualStockEntry(dto: ManualStockEntryDto, konumIdOrKodu: string) {
    const cleanKonum = konumIdOrKodu.trim().toUpperCase();

    // Raf doğrulaması
    const hedefKonum = await this.prisma.depoKonum.findFirst({
      where: {
        OR: [
          { id: cleanKonum.toLowerCase().length === 36 ? cleanKonum : undefined },
          { konumKodu: cleanKonum }
        ]
      }
    });

    if (!hedefKonum) throw new BadRequestException(`Seçilen raf konumu (${cleanKonum}) bulunamadı.`);
    if (hedefKonum.isFull) throw new BadRequestException('Bu raf kilitli/dolu!');
    if (hedefKonum.tanimliBeden !== dto.beden) {
      throw new BadRequestException(`Bu rafa sadece ${hedefKonum.tanimliBeden} beden ürünler girebilir.`);
    }

    // Manuel varyant/ürün oluşturma tetikleyicisi
    const varyant = await this.productsService.createManualProduct({
      barkod: dto.barkod.trim().toUpperCase(),
      urunAdi: dto.urunAdi,
      marka: dto.marka,
      renk: dto.renk,
      beden: dto.beden,
      sku: dto.sku.trim().toUpperCase(),
      miktar: dto.miktar, 
    });

    return this.prisma.$transaction(async (tx) => {
      // Yeni varyantı miktar bazlı ilgili rafa eşle
      const rafStokKaydi = await tx.rafStok.upsert({
        where: {
          konumId_varyantId: {
            konumId: hedefKonum.id,
            varyantId: varyant.id,
          },
        },
        update: {
          miktar: { increment: dto.miktar },
        },
        create: {
          konumId: hedefKonum.id,
          varyantId: varyant.id,
          miktar: dto.miktar,
        },
      });

      // GÜNCELLEME: Konum bağı buraya da entegre edildi
      await tx.sayimKaydi.create({
        data: {
          varyantId: varyant.id,
          konumId: hedefKonum.id,
          barkod: dto.barkod.trim().toUpperCase(),
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

  /**
   * 5. Son stok hareketleri (İlişkili konum bilgisi dahil edildi)
   */
  async getVaryantHistory(varyantId: string) {
    return this.prisma.sayimKaydi.findMany({
      where: { varyantId },
      include: {
        konum: true // Sayımın hangi rafta yapıldığını arayüzde görebilmek için include ettik
      },
      orderBy: { kayitTarihi: 'desc' },
      take: 20,
    });
  }

  /**
   * 6. Genel stok özeti
   */
  async getStockSummary() {
    const summary = await this.prisma.rafStok.aggregate({
      _sum: { miktar: true },
    });

    const toplamVaryantTipi = await this.prisma.varyant.count();

    return {
      toplamVaryantSayisi: toplamVaryantTipi,
      toplamStokAdedi: summary._sum.miktar || 0,
    };
  }
}
