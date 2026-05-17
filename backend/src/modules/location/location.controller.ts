import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // Yeni Raf Tanımla
  @Post()
  async create(@Body() dto: CreateLocationDto) {
    return this.locationService.createLocation(dto);
  }

  // Tüm Rafları ve İçlerindeki Stokları Getir
  @Get()
  async findAll() {
    return this.locationService.findAllLocations();
  }

  // Belirli Bir Rafın İçindeki Ürünleri Getir
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.locationService.findLocationById(id);
  }
}
