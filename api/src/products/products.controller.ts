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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-responses.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('invoiced')
  @ApiOperation({ summary: 'Products invoiced at least once' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: ProductResponseDto,
    isArray: true,
  })
  getInvoicedProducts() {
    return this.productsService.getInvoicedProducts();
  }

  @Get('uninvoiced')
  @ApiOperation({ summary: 'Uninvoiced products view' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: ProductResponseDto,
    isArray: true,
  })
  getUninvoicedProducts() {
    return this.productsService.getUninvoicedProducts();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
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
  @ApiOperation({ summary: 'List all products' })
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
  @ApiOperation({ summary: 'Get product by product code' })
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
  @ApiOperation({ summary: 'Update product' })
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
  @ApiOperation({ summary: 'Delete product' })
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
