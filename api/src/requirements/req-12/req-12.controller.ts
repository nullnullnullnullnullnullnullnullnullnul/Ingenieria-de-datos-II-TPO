import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { ProductResponseDto } from '../../products/dto/product-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/12')
export class Req12Controller {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Retrieves products that have never been invoiced.
   * @returns List of products
   */
  @Get()
  @ApiOperation({ summary: 'Req 12: Uninvoiced products view' })
  @ApiResponse({
    status: 200,
    description: 'Query results',
    type: ProductResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.productsService.getUninvoicedProducts();
  }
}
