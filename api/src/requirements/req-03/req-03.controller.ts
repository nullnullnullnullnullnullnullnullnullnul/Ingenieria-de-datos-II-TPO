import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { EachPhoneResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/3')
export class Req03Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves each phone with client data.
   * @returns List of phones with client data
   */
  @Get()
  @ApiOperation({
    summary: 'Req 03: Cada telefono junto con los datos del cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'List of phones with client data',
    type: EachPhoneResponseDto,
    isArray: true,
  })
  async getResults() {
    return this.clientsService.getEachPhoneWithClientData();
  }
}
