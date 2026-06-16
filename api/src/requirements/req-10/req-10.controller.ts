import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { ClientTotalSpentResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Cross-DB Requirements')
@Controller('requirements/10')
export class Req10Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves the total spent per client (Cross-DB query).
   * @returns List of clients with their total spent amount
   */
  @Get()
  @ApiOperation({ summary: 'Req 10: Total spent per client' })
  @ApiResponse({
    status: 200,
    description: 'Clients with total spent amount',
    type: ClientTotalSpentResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.clientsService.getTotalSpent();
  }
}
