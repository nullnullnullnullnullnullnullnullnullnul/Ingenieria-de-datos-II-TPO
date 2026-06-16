import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { ClientResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/1')
export class Req01Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves all clients with their phones.
   * @returns List of all clients
   */
  @Get()
  @ApiOperation({ summary: 'Req 01: Datos de los clientes con sus telefonos' })
  @ApiResponse({
    status: 200,
    description: 'List of all clients with their phones',
    type: ClientResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.clientsService.getClientsWithPhones();
  }
}
