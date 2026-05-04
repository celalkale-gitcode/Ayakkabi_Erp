import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Yeni bir ürünü, varyantları ve barkodlarıyla birlikte oluşturur
  @Post()
  async create(@Body() createProductDto: any) {
    return this.productsService.createFullProduct(createProductDto);
  }

  // Tüm ürünleri (varyantlarıyla birlikte) listeler
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  // Tek bir ürünü ID ile detaylı getirir
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Ürünü siler (onDelete: Cascade sayesinde varyantlar da silinir)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

