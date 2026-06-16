import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { ProductResponseDto } from '../../products/dto/product-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/8')
export class Req08Controller {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Retrieves products that have been invoiced at least once.
   * @returns List of products
   */
  @Get()
  @ApiOperation({ summary: 'Req 08: Products invoiced at least once' })
  @ApiResponse({
    status: 200,
    description: 'Query results',
    type: ProductResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.productsService.getInvoicedProducts();
  }
}
