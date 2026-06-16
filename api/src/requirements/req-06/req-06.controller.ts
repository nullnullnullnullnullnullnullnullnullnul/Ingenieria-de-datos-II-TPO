import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { ClientInvoiceCountResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Cross-DB Requirements')
@Controller('requirements/6')
export class Req06Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves the number of invoices per client (Cross-DB query).
   * @returns List of clients with their invoice count
   */
  @Get()
  @ApiOperation({ summary: 'Req 06: Number of invoices per client' })
  @ApiResponse({
    status: 200,
    description: 'Clients with invoice count',
    type: ClientInvoiceCountResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.clientsService.getInvoiceCounts();
  }
}
