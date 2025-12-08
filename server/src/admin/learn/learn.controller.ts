import { Body, Controller, Get, Param, Delete, Post, Put, Query, Req, Res } from "@nestjs/common";
import { ParseIntArrayPipe } from "@/common/pipe/parse-int-array.pipe";
import Result from "@/common/result/Result";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LearnService } from '@/admin/learn/service/learn.service';
import { CreateLearnDto, QueryLearnDto, UpdateLearnDto } from './dto/learnDto';
import { LearnLession } from '@prismaClient';
import { RequirePermission } from '@/common/decorator/require-premission.decorator';
import { TableDataInfo } from '@/common/domain/TableDataInfo';
import { nowDateTime } from '@/common/utils';

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

  @ApiOperation({ summary: '新增教程' })
  @ApiResponse({ type: Result<LearnLession> })
  @ApiBody({ type: CreateLearnDto })
  @RequirePermission("learn:add")
  @Post("/")
  async addLearn(
    @Body() learn: CreateLearnDto,
    @Req() req,
  ): Promise<Result<LearnLession>> {
    learn = {
      ...learn,
      createTime: nowDateTime(),
      updateTime: nowDateTime(),
      createBy: req.user?.userName,
      updateBy: req.user?.userName,
    }
    return Result.ok(await this.learnService.addLearn(learn))
  }

  @ApiOperation({ summary: "修改教程" })
  @ApiResponse({ type: Result<any> })
  @ApiBody({ type: UpdateLearnDto })
  @RequirePermission("learn:edit")
  @Put("/")
  async updateLearn(
    @Body() learn: UpdateLearnDto,
    @Req() req,
  ): Promise<Result<any>> {
    learn = {
      ...learn,
      updateTime: nowDateTime(),
      updateBy: req.user?.username,
    }
    await this.learnService.updateLearnLession(learn)
    return Result.ok("修改成功! ")
  }

  @ApiOperation({ summary: "删除教程" })
  @ApiResponse({ type: Result<any> })
  @RequirePermission("learn:remove")
  @Delete("/:ids")
  async delLearn(
    @Param("ids", ParseIntArrayPipe) learnIds: number[],
  ): Promise<Result<any>> {
    const { count } = await this.learnService.deleteLearnIds(learnIds)
    return Result.toAjax(count);
  }
}