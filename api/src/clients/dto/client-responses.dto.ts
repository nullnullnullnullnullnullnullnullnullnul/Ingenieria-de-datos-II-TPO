import { ApiProperty } from '@nestjs/swagger';

export class ClientPhoneResponseDto {
  @ApiProperty({ description: 'Area code' })
  areaCode: number;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber: number;

  @ApiProperty({ description: 'Type of phone (F = fijo, M = movil)' })
  type: string;
}

export class ClientResponseDto {
  @ApiProperty({ description: 'Client number / ID' })
  clientNumber: number;

  @ApiProperty({ description: 'Client name' })
  name: string;

  @ApiProperty({ description: 'Client last name' })
  lastName: string;

  @ApiProperty({ description: 'Client address', required: false })
  address?: string;

  @ApiProperty({
    description: 'Numeric status (TINYINT, 0-255) from the dataset',
    required: false,
  })
  active?: number;

  @ApiProperty({
    type: [ClientPhoneResponseDto],
    description: 'List of phone numbers',
    required: false,
  })
  phones?: ClientPhoneResponseDto[];
}

export class ClientPhonesOnlyResponseDto {
  @ApiProperty({ description: 'Client number / ID' })
  clientNumber: number;

  @ApiProperty({
    type: [ClientPhoneResponseDto],
    description: 'List of phone numbers',
  })
  phones: ClientPhoneResponseDto[];
}

export class EachPhoneResponseDto {
  @ApiProperty({ description: 'Client number / ID' })
  clientNumber: number;

  @ApiProperty({ description: 'Client name' })
  name: string;

  @ApiProperty({ description: 'Client last name' })
  lastName: string;

  @ApiProperty({ description: 'Client address' })
  address: string;

  @ApiProperty({ description: 'Area code' })
  areaCode: number;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber: number;

  @ApiProperty({ description: 'Type of phone (F = fijo, M = movil)' })
  type: string;
}

export class ClientInvoiceCountResponseDto extends ClientResponseDto {
  @ApiProperty({ description: 'Total number of invoices' })
  invoiceCount: number;
}

export class ClientTotalSpentResponseDto extends ClientResponseDto {
  @ApiProperty({ description: 'Total amount spent' })
  totalSpent: number;
}
