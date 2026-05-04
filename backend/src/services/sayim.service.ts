import prisma from '../config/db';

export class SayimService {
  static async barkodlaSayimYap(barkod: string, miktar: number) {
    // 1. Barkod üzerinden varyantı bul
    const barkodKaydi = await prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { varyant: true }
    });

    if (!barkodKaydi) {
      throw new Error('Okutulan barkod sistemde kayıtlı değil!');
    }

    // 2. Transaction (İşlem Garantisi): Stok güncelleme ve sayım kaydı oluşturma
    return await prisma.$transaction(async (tx) => {
      // Stok miktarını artır
      const guncelVaryant = await tx.varyant.update({
        where: { id: barkodKaydi.varyantId },
        data: { stokMiktari: { increment: miktar } }
      });

      // Sayım günlüğüne (log) ekle
      const sayimLog = await tx.sayimKaydi.create({
        data: {
          varyantId: barkodKaydi.varyantId,
          barkod: barkod,
          miktar: miktar,
          islemTipi: 'SAYIM'
        }
      });

      return { guncelVaryant, sayimLog };
    });
  }
}

