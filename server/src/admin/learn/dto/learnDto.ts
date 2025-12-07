import { BaseDomain } from "@/common/domain/BaseDomain";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";
import { queryDomain } from "@/common/domain/queryDomain";

export class QueryLearnDto extends queryDomain {
  @ApiProperty({ description: "教程主键", required: false })
  @IsOptional()
  @IsNumber()
  id: Number | null;
  @ApiProperty({ description: "教程名称", required: false })
  @IsOptional()
  name: string | null;
  @ApiProperty({ description: "教程描述", required: false })
  @IsOptional()
  remark: string | null;
}