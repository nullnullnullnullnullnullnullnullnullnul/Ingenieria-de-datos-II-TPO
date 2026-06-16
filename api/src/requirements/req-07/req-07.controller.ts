import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from '../../invoices/invoices.service';
import { InvoiceResponseDto } from '../../invoices/dto/invoice-responses.dto';

@ApiTags('Cross-DB Requirements')
@Controller('requirements/7')
export class Req07Controller {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Retrieves Kai Bullock's invoices (Cross-DB query).
   * @returns List of invoices
   */
  @Get()
  @ApiOperation({ summary: "Req 07: Kai Bullock's invoices" })
  @ApiResponse({
    status: 200,
    description: "Kai Bullock's invoices",
    type: InvoiceResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Kai Bullock not found in Mongo' })
  async getResults() {
    return this.invoicesService.getInvoicesByClientName('Kai', 'Bullock');
  }
}
