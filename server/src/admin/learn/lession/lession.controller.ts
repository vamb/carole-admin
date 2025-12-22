import { Body, Controller, Get, Param, Delete, Post, Put, Query, Req, ParseIntPipe, Patch } from '@nestjs/common';
import { ParseIntArrayPipe } from "@/common/pipe/parse-int-array.pipe";
import Result from "@/common/result/Result";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LessionService } from '@/admin/learn/lession/service/lession.service';
import {
  CreateLessionBookDto,
  CreateLessionDto,
  QueryLessionDto,
  UpdateLessionBookDto,
  UpdateLessionDto,
} from './dto/lessionDto';
import { LearnLession } from '@prismaClient';
import { RequirePermission } from '@/common/decorator/require-premission.decorator';
import { TableDataInfo } from '@/common/domain/TableDataInfo';
import { nowDateTime } from '@/common/utils';

@ApiTags("教学教程")
@ApiBearerAuth()
@Controller("lession")
export class LessionController {
  constructor(private lessionService: LessionService ) {}

  @ApiOperation({ summary: "分页查询课程数据" })
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

  // ================= 创建课程

  @ApiOperation({ summary: "创建新的教程并关联已有的课本" })
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

  @ApiOperation({ summary: "获取所有的课程列表及关联的课本列表" })
  @Get("/allLessionBooks")
  async allLessionBooks(): Promise<Result<any>> {
    try {
      return Result.ok(await this.lessionService.findAllLession())
    }catch (error) {
      return Result.Error(error?.message)
    }
  }

  @ApiOperation({ summary: "获取某一个课程的信息及该课程的关联课本列表" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<any> {
    try {
      const data = await this.lessionService.findOne(id);
      return Result.ok(data)
    }catch (err) {
      return Result.Error("")
    }
  }

  @ApiOperation({ summary: "更新某一个课程的信息或这个课程的关联课本列表" })
  @Patch(":id")
  async updata(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLessionBookDto: UpdateLessionBookDto,
    @Req() req,
  ): Promise<any> {
    updateLessionBookDto = {
      ...updateLessionBookDto,
      updateTime: nowDateTime(),
      updateBy: req.user?.userName
    }
    const data = await this.lessionService.updateLearnLessionBook(id, updateLessionBookDto)
    return Result.ok(data)
  }

  @ApiOperation({ summary: "关联删除某一个课程及课本的关联信息" })
  @Delete(":id")
  async removeOne(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.lessionService.removeOne(id)
  }

  @ApiOperation({ summary: "对某一个课程创建其对课本的关联关系" })
  @Post(":id/books")
  async addBooks(
    @Param('id', ParseIntPipe) id: number,
    @Body('bookIds') bookIds: number[],
  ): Promise<any> {
    try {
      return Result.ok(await this.lessionService.addBooksToLession(id, bookIds))
    } catch (error) {
      return Result.Error(error?.message)
    }
  }
}