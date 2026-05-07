import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // Normal ürün oluşturma
  @Post()
  async create(
    @Body()
    dto: CreateProductDto,
  ) {

    return this.productsService
      .createFullProduct(dto);
  }

  // Tüm ürünleri listele
  @Get()
  async findAll() {

    return this.productsService
      .findAll();
  }
}
