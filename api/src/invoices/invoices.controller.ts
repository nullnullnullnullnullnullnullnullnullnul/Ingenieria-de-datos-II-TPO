import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import {
  InvoiceResponseDto,
  InvoiceWithProductResponseDto,
} from './dto/invoice-responses.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('by-client-name/:name/:lastName')
  @ApiOperation({ summary: 'Get invoices by client name' })
  @ApiParam({ name: 'name', type: 'string', description: 'Client name' })
  @ApiParam({
    name: 'lastName',
    type: 'string',
    description: 'Client last name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of invoices for the specified client',
    type: InvoiceResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Client with that name and last name not found',
  })
  getInvoicesByClientName(
    @Param('name') name: string,
    @Param('lastName') lastName: string,
  ) {
    return this.invoicesService.getInvoicesByClientName(name, lastName);
  }

  @Get('with-ipsum-products')
  @ApiOperation({ summary: 'Invoices with "Ipsum" products' })
  @ApiResponse({
    status: 200,
    description: 'List of invoices and their details',
    type: InvoiceWithProductResponseDto,
    isArray: true,
  })
  getInvoicesWithIpsumProducts() {
    return this.invoicesService.getInvoicesWithIpsumProducts();
  }

  @Get('by-date')
  @ApiOperation({ summary: 'Invoices by date view' })
  @ApiResponse({
    status: 200,
    description: 'List of invoices ordered by date',
    type: InvoiceResponseDto,
    isArray: true,
  })
  getInvoicesByDate() {
    return this.invoicesService.getInvoicesByDate();
  }
}
