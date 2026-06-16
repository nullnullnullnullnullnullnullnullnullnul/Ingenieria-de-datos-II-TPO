import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { ClientPhonesOnlyResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/2')
export class Req02Controller {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Retrieves phones for Jacob Cooper.
   * @returns Phones of Jacob Cooper
   */
  @Get()
  @ApiOperation({ summary: 'Req 02: Telefonos de Jacob Cooper' })
  @ApiResponse({
    status: 200,
    description: 'Phones of Jacob Cooper',
    type: ClientPhonesOnlyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Jacob Cooper not found' })
  async getResults() {
    return this.clientsService.getPhonesByClientName('Jacob', 'Cooper');
  }
}
