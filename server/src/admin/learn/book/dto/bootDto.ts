import { BaseDomain } from "@/common/domain/BaseDomain";
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { queryDomain } from '@/common/domain/queryDomain';

export class QueryBootDto extends queryDomain {
  @ApiProperty({ description: "课本主键", required: false })
  @IsOptional()
  @IsNumber()
  id: number | null;
  @ApiProperty({ description: "课本名称", required: false })
  @IsOptional()
  @IsString()
  name: string | null;
  @ApiProperty({ description: "课本描述", required: false })
  @IsOptional()
  @IsString()
  remark: string | null;
}

export class CreateBookDto extends BaseDomain {
  @ApiProperty({ description: "课本名称" })
  @IsNotEmpty({ message: "课本名称不能为空" })
  @IsString()
  name: string;

  @ApiProperty({ description: "课本描述" })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateBookDto extends BaseDomain {
  @ApiProperty({ description: "课本主键" })
  @IsNotEmpty({ message: "课本主键不能为空" })
  @Transform((v) => +v.value)
  @IsNumber()
  id: number;
  @ApiProperty({ description: "课本名称" })
  @IsNotEmpty({ message: "课本名称不能为空" })
  @IsString()
  name: string;
  @ApiProperty({ description: "课本备注", required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}