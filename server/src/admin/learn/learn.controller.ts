import { Body, Controller, Get, Param, Delete, Post, Put, Query, Res } from "@nestjs/common";
import { ParseIntArrayPipe } from "@/common/pipe/parse-int-array.pipe";
import Result from "@/common/result/Result";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LearnService } from '@/admin/learn/service/learn.service';
import { QueryLearnDto } from "./dto/learnDto";
import { LearnLession } from '@prismaClient';
import { RequirePermission } from '@/common/decorator/require-premission.decorator';
import { TableDataInfo } from '@/common/domain/TableDataInfo';

@ApiTags("教学")
@ApiBearerAuth()
@Controller("learn")
export class LearnController {
  constructor(private learnService: LearnService ) {}

  @ApiResponse({ type: TableDataInfo<LearnLession> })
  @RequirePermission("learn:query")
  @Get("/list")
  async listLearn(
    @Query() q: QueryLearnDto
  ): Promise<TableDataInfo<LearnLession>> {
    return Result.TableData(await this.learnService.selectLearnLession(q));
  }
}