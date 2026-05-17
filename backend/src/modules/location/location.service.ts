import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  // 1. Yeni Raf/Konum Tanımlama
  async createLocation(dto: CreateLocationDto) {
    const existingLocation = await this.prisma.depoKonum.findUnique({
      where: { konumKodu: dto.konumKodu },
    });

    if (existingLocation) {
      throw new ConflictException('Bu konum kodu zaten sistemde kayıtlı.');
    }

    return this.prisma.depoKonum.create({
      data: dto,
    });
  }

  // 2. Tüm Depo Konumlarını ve İçlerindeki Stokları Listeleme
  async findAllLocations() {
    return this.prisma.depoKonum.findMany({
      include: {
        rafStoklari: {
          include: {
            varyant: {
              include: { urun: true }
            }
          }
        }
      },
      orderBy: { konumKodu: 'asc' },
    });
  }

  // 3. Tek Bir Rafın Detayını ve İçindeki Ayakkabıları Getirme
  async findLocationById(id: string) {
    const konum = await this.prisma.depoKonum.findUnique({
      where: { id },
      include: {
        rafStoklari: {
          include: {
            varyant: {
              include: { urun: true }
            }
          }
        }
      },
    });

    if (!konum) {
      throw new NotFoundException('Aranan depo konumu bulunamadı.');
    }

    return konum;
  }
}
