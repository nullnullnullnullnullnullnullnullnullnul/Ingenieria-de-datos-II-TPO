import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { ProductResponseDto } from '../../products/dto/product-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/14/products')
export class Req14Controller {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Req 14: Create product (PostgreSQL)' })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed: malformed request body',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Req 14: List all products' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: ProductResponseDto,
    isArray: true,
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Req 14: Get product by id' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product code (not an integer)',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Req 14: Modify product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product code (not an integer)',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Req 14: Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({
    status: 400,
    description: 'Invalid product code (not an integer)',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
