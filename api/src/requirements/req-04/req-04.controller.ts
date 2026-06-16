import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { ClientResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Cross-DB Requirements')
@Controller('requirements/4')
export class Req04Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves clients that have at least one invoice (Cross-DB query).
   * @returns List of clients
   */
  @Get()
  @ApiOperation({ summary: 'Req 04: Clients with invoices' })
  @ApiResponse({
    status: 200,
    description: 'Clients with at least one invoice',
    type: ClientResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.clientsService.getClientsWithInvoices();
  }
}
