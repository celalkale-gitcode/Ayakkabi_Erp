import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaService } from '../../core/database/prisma.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, PrismaService],
  exports: [LocationService], // Gerekirse başka modüller de raflara erişebilsin
})
export class LocationModule {}
