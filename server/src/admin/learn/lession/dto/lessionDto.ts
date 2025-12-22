import { BaseDomain } from "@/common/domain/BaseDomain";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsInt } from "class-validator";
import { Type } from 'class-transformer';
import { queryDomain } from "@/common/domain/queryDomain";

export class QueryLessionDto extends queryDomain {
  @ApiProperty({ description: "教程主键", required: false })
  @IsOptional()
  @IsNumber()
  id: number | null;
  @ApiProperty({ description: "教程名称", required: false })
  @IsOptional()
  name: string | null;
  @ApiProperty({ description: "教程描述", required: false })
  @IsOptional()
  remark: string | null;
}

export class CreateLessionDto extends BaseDomain {
  @ApiProperty({ description: '课程名称' })
  @IsNotEmpty({ message: "名称不能为空" })
  @IsString()
  name: string;

  @ApiProperty({ description: "课程描述" })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateLessionDto extends BaseDomain {
  @ApiProperty({ description: "教程主键" })
  @IsNotEmpty({ message: "主键不能为空" })
  @Transform((v) => + v.value)
  @IsNumber()
  id: number;
  @ApiProperty({ description: "教程名称" })
  @IsNotEmpty({ message: "教程名称不能为空" })
  @IsString()
  name: string;
  @ApiProperty({ description: "备注", required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

// @ts-ignore
export class CreateLessionBookDto extends BaseDomain {
  @IsNotEmpty({ message: '课程名称不能为空' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  bookIds?: number[];
}

export class UpdateLessionBookDto extends BaseDomain {
  @IsNotEmpty({ message: '课程名称不能为空' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  bookIds?: number[];
}