import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from '../../invoices/invoices.service';
import { InvoiceResponseDto } from '../../invoices/dto/invoice-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/11')
export class Req11Controller {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Retrieves invoices ordered by date.
   * @returns List of invoices
   */
  @Get()
  @ApiOperation({ summary: 'Req 11: Invoices by date view' })
  @ApiResponse({
    status: 200,
    description: 'Query results',
    type: InvoiceResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.invoicesService.getInvoicesByDate();
  }
}
