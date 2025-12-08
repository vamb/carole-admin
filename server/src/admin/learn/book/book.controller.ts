import { Body, Controller, Get, Param, Delete, Post, Put, Query, Req, Res } from "@nestjs/common";
import { ParseIntArrayPipe } from "@/common/pipe/parse-int-array.pipe";
import Result from "@/common/result/Result";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookService } from "./service/book.service";
import { CreateBookDto, QueryBootDto, UpdateBookDto } from './dto/bootDto';
import { LearnBook } from "@prismaClient";
import { RequirePermission } from '@/common/decorator/require-premission.decorator';
import { TableDataInfo } from '@/common/domain/TableDataInfo';
import { nowDateTime } from '@/common/utils';

@ApiTags("教学课本")
@ApiBearerAuth()
@Controller("book")
export class BookController {
  constructor(private bookService: BookService) {}

  @ApiResponse({ type: TableDataInfo<LearnBook> })
  @RequirePermission("book:query")
  @Get("/list")
  async listLearnBook(
    @Query() q: QueryBootDto
  ): Promise<TableDataInfo<LearnBook>> {
    return Result.TableData(await this.bookService.selectLearnBook(q));
  }

  @ApiOperation({ summary: "新增课本" })
  @ApiResponse({ type: Result<LearnBook> })
  @ApiBody({ type: CreateBookDto })
  @RequirePermission("book:add")
  @Post("/")
  async addLearnBook(
    @Body() learnBook: CreateBookDto,
    @Req() req,
  ): Promise<Result<LearnBook>> {
    learnBook = {
      ...learnBook,
      createTime: nowDateTime(),
      updateTime: nowDateTime(),
      createBy: req.user?.userName,
      updateBy: req.user?.userName,
    }
    return Result.ok(await this.bookService.addLearnBook(learnBook))
  }

  @ApiOperation({ summary: "修改课本" })
  @ApiResponse({ type: Result<any> })
  @ApiBody({ type: UpdateBookDto })
  @RequirePermission("book:edit")
  @Put("/")
  async updateLearnBook(
    @Body() learnBook: UpdateBookDto,
    @Req() req,
  ): Promise<Result<any>> {
    learnBook = {
      ...learnBook,
      updateTime: nowDateTime(),
      updateBy: req.user?.userName,
    }
    await this.bookService.updateLearnBook(learnBook)
    return Result.ok("修改成功！")
  }

  @ApiOperation({ summary: "删除课本" })
  @ApiResponse({ type: Result<any> })
  @RequirePermission("book:remove")
  @Delete("/:ids")
  async delLearnBook(
    @Param("ids", ParseIntArrayPipe) learnBookIds: number[],
  ): Promise<Result<any>> {
    const { count } = await this.bookService.deleteLearnBookIds(learnBookIds)
    return Result.toAjax(count)
  }
}