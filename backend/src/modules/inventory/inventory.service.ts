import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async processScan(barkod: string, miktar: number) {
    const bcRecord = await this.prisma.urunBarkod.findUnique({
      where: { barkod },
      include: { varyant: true }
    });

    if (!bcRecord) throw new NotFoundException('Barkod bulunamadı.');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.varyant.update({
        where: { id: bcRecord.varyantId },
        data: { stokMiktari: { increment: miktar } }
      });

      await tx.sayimKaydi.create({
        data: { varyantId: bcRecord.varyantId, barkod, miktar }
      });

      return updated;
    });
  }
}
