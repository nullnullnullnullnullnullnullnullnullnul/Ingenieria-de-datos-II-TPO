import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from '../../invoices/invoices.service';
import { InvoiceWithProductResponseDto } from '../../invoices/dto/invoice-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/9')
export class Req09Controller {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Retrieves invoices that contain products whose brand matches "Ipsum".
   * @returns List of invoices and their details
   */
  @Get()
  @ApiOperation({ summary: 'Req 09: Invoices with "Ipsum" products' })
  @ApiResponse({
    status: 200,
    description: 'Query results',
    type: InvoiceWithProductResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.invoicesService.getInvoicesWithIpsumProducts();
  }
}
