import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { ClientResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Cross-DB Requirements')
@Controller('requirements/5')
export class Req05Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves clients that have no invoices (Cross-DB query).
   * @returns List of clients
   */
  @Get()
  @ApiOperation({ summary: 'Req 05: Clients without invoices' })
  @ApiResponse({
    status: 200,
    description: 'Clients without invoices',
    type: ClientResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.clientsService.getClientsWithoutInvoices();
  }
}
