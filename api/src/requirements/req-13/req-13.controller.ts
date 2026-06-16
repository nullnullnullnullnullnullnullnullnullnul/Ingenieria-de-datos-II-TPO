import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../clients/clients.service';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { ClientResponseDto } from '../../clients/dto/client-responses.dto';

@ApiTags('Requirements')
@Controller('requirements/13/clients')
export class Req13Controller {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Req 13: Create client (MongoDB)' })
  @ApiResponse({
    status: 201,
    description: 'Client created',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed: malformed request body',
  })
  @ApiResponse({
    status: 409,
    description: 'A client with that clientNumber already exists',
  })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Req 13: List all clients' })
  @ApiResponse({
    status: 200,
    description: 'List of clients',
    type: ClientResponseDto,
    isArray: true,
  })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Req 13: Get client by client number' })
  @ApiResponse({
    status: 200,
    description: 'Client found',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid client number (not an integer)',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Req 13: Modify client' })
  @ApiResponse({
    status: 200,
    description: 'Client updated',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid client number (not an integer)',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateClientDto>,
  ) {
    return this.clientsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Req 13: Delete client' })
  @ApiResponse({ status: 200, description: 'Client deleted' })
  @ApiResponse({
    status: 400,
    description: 'Invalid client number (not an integer)',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }
}
