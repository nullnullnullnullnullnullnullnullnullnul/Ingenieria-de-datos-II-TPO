import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product code' })
  productCode: number;

  @ApiProperty({ description: 'Brand' })
  brand: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiProperty({ description: 'Price' })
  price: number;

  @ApiProperty({ description: 'Current stock' })
  stock: number;
}

export class TopSoldProductResponseDto extends ProductResponseDto {
  @ApiProperty({ description: 'Total quantity sold' })
  quantitySold: number;
}

export class TopBilledProductResponseDto extends ProductResponseDto {
  @ApiProperty({ description: 'Total amount billed' })
  totalBilled: number;
}
