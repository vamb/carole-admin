import { Body, Controller, Get, Param, Delete, Post, Put, Query, Req, Res } from "@nestjs/common";
import { ParseIntArrayPipe } from "@/common/pipe/parse-int-array.pipe";
import Result from "@/common/result/Result";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LessionService } from '@/admin/learn/lession/service/lession.service';
import { CreateLessionBookDto, CreateLessionDto, QueryLessionDto, UpdateLessionDto } from './dto/lessionDto';
import { LearnLession } from '@prismaClient';
import { RequirePermission } from '@/common/decorator/require-premission.decorator';
import { TableDataInfo } from '@/common/domain/TableDataInfo';
import { nowDateTime } from '@/common/utils';

@ApiTags("教学教程")
@ApiBearerAuth()
@Controller("lession")
export class LessionController {
  constructor(private lessionService: LessionService ) {}

  @ApiResponse({ type: TableDataInfo<LearnLession> })
  @RequirePermission("lession:query")
  @Get("/list")
  async listLearnLession(
    @Query() q: QueryLessionDto
  ): Promise<TableDataInfo<LearnLession>> {
    return Result.TableData(await this.lessionService.selectLearnLession(q));
  }

  @ApiOperation({ summary: '新增教程' })
  @ApiResponse({ type: Result<LearnLession> })
  @ApiBody({ type: CreateLessionDto })
  @RequirePermission("lession:add")
  @Post("/")
  async addLearnLession(
    @Body() learnLession: CreateLessionDto,
    @Req() req,
  ): Promise<Result<LearnLession>> {
    learnLession = {
      ...learnLession,
      createTime: nowDateTime(),
      updateTime: nowDateTime(),
      createBy: req.user?.userName,
      updateBy: req.user?.userName,
    }
    return Result.ok(await this.lessionService.addLearn(learnLession))
  }

  @ApiOperation({ summary: "修改教程" })
  @ApiResponse({ type: Result<any> })
  @ApiBody({ type: UpdateLessionDto })
  @RequirePermission("lession:edit")
  @Put("/")
  async updateLearnLession(
    @Body() learn: UpdateLessionDto,
    @Req() req,
  ): Promise<Result<any>> {
    learn = {
      ...learn,
      updateTime: nowDateTime(),
      updateBy: req.user?.userName,
    }
    await this.lessionService.updateLearnLession(learn)
    return Result.ok("修改成功! ")
  }

  @ApiOperation({ summary: "删除教程" })
  @ApiResponse({ type: Result<any> })
  @RequirePermission("lession:remove")
  @Delete("/:ids")
  async delLearnLession(
    @Param("ids", ParseIntArrayPipe) learnLessionIds: number[],
  ): Promise<Result<any>> {
    const { count } = await this.lessionService.deleteLearnLessionIds(learnLessionIds)
    return Result.toAjax(count);
  }

  @Post("/addLessionBooks")
  async createLessionBooks(
    @Body() createLessionBookDto: CreateLessionBookDto,
    @Req() req,
  ): Promise<Result<any>> {
    createLessionBookDto = {
      ...createLessionBookDto,
      createTime: nowDateTime(),
      updateTime: nowDateTime(),
      createBy: req.user?.userName,
      updateBy: req.user?.userName,
    }
    await this.lessionService.createLeassionBook(createLessionBookDto)
    return Result.ok("创建成功!")
  }
}