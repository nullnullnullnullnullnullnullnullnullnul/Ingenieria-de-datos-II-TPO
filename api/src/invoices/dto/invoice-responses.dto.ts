import { ApiProperty } from '@nestjs/swagger';

export class InvoiceResponseDto {
  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber: number;

  @ApiProperty({ description: 'Issue date', type: Date })
  issueDate: Date;

  @ApiProperty({ description: 'Subtotal amount' })
  subtotal: number;

  @ApiProperty({ description: 'VAT amount' })
  vat: number;

  @ApiProperty({ description: 'Total with VAT' })
  totalWithVat: number;

  @ApiProperty({ description: 'Client number associated' })
  clientNumber: number;
}

export class InvoiceWithProductResponseDto extends InvoiceResponseDto {
  @ApiProperty({ description: 'Line item number' })
  lineNumber: number;

  @ApiProperty({ description: 'Quantity of product' })
  quantity: number;

  @ApiProperty({ description: 'Product code' })
  productCode: number;

  @ApiProperty({ description: 'Product brand' })
  brand: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiProperty({ description: 'Product stock' })
  stock: number;
}
