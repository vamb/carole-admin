import { IsNotEmpty, IsString } from "class-validator";
import { queryDomain } from "@/common/domain/queryDomain";

export class WorkStateChangeDto extends queryDomain {
  @IsNotEmpty({ message: 'workState不能为空' })
  @IsString()
  workState: string;
}