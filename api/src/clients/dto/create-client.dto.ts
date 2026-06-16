import {
  IsString,
  IsInt,
  IsIn,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PhoneDto {
  @ApiProperty()
  @IsInt()
  areaCode: number;

  @ApiProperty()
  @IsInt()
  phoneNumber: number;

  @ApiProperty({ enum: ['F', 'M'] })
  @IsIn(['F', 'M'])
  type: string;
}

export class CreateClientDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  clientNumber: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsInt()
  active: number;

  @ApiProperty({ type: [PhoneDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones?: PhoneDto[];
}
