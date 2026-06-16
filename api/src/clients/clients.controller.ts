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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import {
  ClientResponseDto,
  ClientInvoiceCountResponseDto,
  ClientTotalSpentResponseDto,
} from './dto/client-responses.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('with-invoices')
  @ApiOperation({ summary: 'Clients with invoices' })
  @ApiResponse({
    status: 200,
    description: 'Clients with at least one invoice',
    type: ClientResponseDto,
    isArray: true,
  })
  getClientsWithInvoices() {
    return this.clientsService.getClientsWithInvoices();
  }

  @Get('without-invoices')
  @ApiOperation({ summary: 'Clients without invoices' })
  @ApiResponse({
    status: 200,
    description: 'Clients without any invoices',
    type: ClientResponseDto,
    isArray: true,
  })
  getClientsWithoutInvoices() {
    return this.clientsService.getClientsWithoutInvoices();
  }

  @Get('invoice-counts')
  @ApiOperation({ summary: 'Number of invoices per client' })
  @ApiResponse({
    status: 200,
    description: 'Clients with their invoice count',
    type: ClientInvoiceCountResponseDto,
    isArray: true,
  })
  getInvoiceCounts() {
    return this.clientsService.getInvoiceCounts();
  }

  @Get('total-spent')
  @ApiOperation({ summary: 'Total spent per client' })
  @ApiResponse({
    status: 200,
    description: 'Clients with their total spent amount',
    type: ClientTotalSpentResponseDto,
    isArray: true,
  })
  getTotalSpent() {
    return this.clientsService.getTotalSpent();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
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
  @ApiOperation({ summary: 'List all clients' })
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
  @ApiOperation({ summary: 'Get client by client number' })
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
  @ApiOperation({ summary: 'Update client' })
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
  @ApiOperation({ summary: 'Delete client' })
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
