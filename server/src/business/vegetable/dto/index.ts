import { BaseDomain } from '@/common/domain/BaseDomain';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { queryDomain } from '@/common/domain/queryDomain';

export class QueryVegetableDto extends queryDomain {

  id;
  name;
  prepareTime;
  desc;
  state;
  purchasePrice;
  createBy;
  createTime;
  remark;
  updateBy;
  updateTime;
}