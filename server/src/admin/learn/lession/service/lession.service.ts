import {
  BadRequestException, Injectable,
  InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { PrismaService } from "@/common/service/prisma/prisma.service";
import { Response } from "express";
import { exportTable, nowDateTime } from '@/common/utils';
import {
  QueryLessionDto, CreateLessionDto, UpdateLessionDto,
  CreateLessionBookDto, UpdateLessionBookDto,
  CreateLessionDetailDto, UpdateLessionDetailDto
} from '../dto/lessionDto';
import { LearnLession, LearnLessionBook, Prisma } from '@prismaClient';
import { isNotEmpty } from 'class-validator';
import { redisUtils } from '@/common/utils/redisUtils';
import { Constants } from '@/common/constant/Constants';

@Injectable()
export class LessionService {
  constructor(private prisma: PrismaService) {}

  async selectLearnLession(q: QueryLessionDto) {
    const queryCondition: Prisma.LearnLessionWhereInput = {};

    if (isNotEmpty(q["id"])) {
      queryCondition.id = {
        equals: q.id
      }
    }

    if (isNotEmpty(q["name"])) {
      queryCondition.name = {
        contains: q.name
      };
    }

    if (isNotEmpty(q['remark'])) {
      queryCondition.remark = {
        contains: q.remark
      }
    }
    return {
      rows: await this.prisma.learnLession.findMany({
        skip: (q.pageNum - 1) * q.pageSize,
        take: q.pageSize,
        where: queryCondition,
      }),
      total: await this.prisma.learnLession.count({
        where: queryCondition
      })
    }
  }

  async addLearn(lession: CreateLessionDto) {
    //删除掉空值
    for (const key in lession) {
      !isNotEmpty(lession[key]) && delete lession[key];
    }
    const d = await this.prisma.learnLession.create({
      data: lession
    })
    return d
  }

  async updateLearnLession(learnLession: UpdateLessionDto) {
    //删除掉空值
    for (const key in learnLession) {
      !isNotEmpty(learnLession[key]) && delete learnLession[key];
    }
    await this.prisma.learnLession.update({
      where: {
        id: learnLession.id,
      },
      data: learnLession
    })
    return true;
  }

  async deleteLearnLessionIds(learnLessionIds: number[]) {
    const r = await this.prisma.learnLession.deleteMany({
      where: {
        id: {
          in: learnLessionIds
        },
      },
    });
    return r;
  }

  async createLeassionBook(createLessionBookDto: CreateLessionBookDto) {
    try {
      // 验证书籍ID是否存在
      if(createLessionBookDto?.bookIds?.length > 0) {
        await this.validateBookIds(createLessionBookDto?.bookIds)
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // 创建课程
        const lession = await tx.learnLession.create({
          data: {
            name: createLessionBookDto?.name,
            createBy: createLessionBookDto?.createBy,
            createTime: createLessionBookDto?.createTime,
            updateBy: createLessionBookDto?.updateBy,
            updateTime: createLessionBookDto?.updateTime,
            remark: createLessionBookDto?.remark,
          }
        })

        // 创建详情
        if(createLessionBookDto?.detail) {
          await tx.learnLessionDetail.create({
            data: {
              lessionId: lession?.id,
              content: createLessionBookDto?.detail?.content || "",
              duration: createLessionBookDto?.detail?.duration || 0,
              createBy: createLessionBookDto?.createBy,
              createTime: createLessionBookDto?.createTime,
              updateBy: createLessionBookDto?.updateBy,
              updateTime: createLessionBookDto?.updateTime,
              remark: createLessionBookDto?.detail?.remark || ""
            }
          })
        }

        if(createLessionBookDto?.bookIds?.length>0) {
          const lessionBookData = createLessionBookDto?.bookIds?.map((bookId) => ({
            lessionId: lession.id,
            bookId,
          }))

          await tx.learnLessionBook.createMany({
            data: lessionBookData,
            skipDuplicates: true
          })
        }

        // 3. 返回完整数据
        return await tx.learnLession.findUnique({
          where: { id: lession.id },
          include: {
            lessionDetail: true,
            lessionBooks: {
              include: {
                book: true,
              },
            },
          },
        });
      });
      return result
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`创建课程失败: ${error?.message}`);
    }
  }

  // 验证书籍ID是否存在
  private async validateBookIds(bookIds: number[]): Promise<void> {
    const existingBooks = await this.prisma.learnBook.findMany({
      where: {
        id: { in: bookIds },
      },
      select: { id: true }
    })

    const existingBookIds = existingBooks.map(book=>book.id)
    const nonExistingBookIds = bookIds.filter(id=>!existingBookIds.includes(id))

    if(nonExistingBookIds.length>0) {
      throw new BadRequestException(`一下书籍ID不存在: ${nonExistingBookIds.join(", ")}`)
    }
  }

  // 查询所有课程（包含详情）
  async findAllLession(): Promise<LearnLession[]> {
    return this.prisma.learnLession.findMany({
      include: {
        lessionDetail: true,
        lessionBooks: {
          include: {
            book: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })
  }

  // 查询单个课程及其关联的的课本列表
  async findOne(id: number): Promise<any> {
    const lession = await this.prisma.learnLession.findUnique({
      where: { id },
      include: {
        lessionDetail: true,
        lessionBooks: {
          include: {
            book: true
          }
        }
      }
    })
    if(!lession) {
      throw new NotFoundException(`ID为 ${id} 的课程不存在`);
    }
    return lession
  }

  // 更新课程
  async updateLearnLessionBook(id: number, updateLessionBookDto: UpdateLessionBookDto): Promise<any> {
    // 检查课程是否存在
    await this.findOne(id)

    const { bookIds, detail, ...updateData } = updateLessionBookDto

    try {
      return await this.prisma.$transaction(async tx => {
        // 1. 更新课程基本信息
        const updatedLession = await tx.learnLession.update({
          where: { id },
          data: updateData
        })

        if(detail) {
          const existingDetail = await tx.learnLessionDetail.findUnique({
            where: { lessionId: id }
          })

          const detailData = {
            ...detail,
          }

          if(existingDetail) {
            await tx.learnLessionDetail.update({
              where: { lessionId: id },
              data: detailData
            })
          } else {
            await tx.learnLessionDetail.create({
              data: {
                ...detailData,
                lessionId: id,
                content: detailData?.content,
                duration: detailData?.duration,

              }
            })
          }
        }

        // 2.如果提供了bookIds，更新关联关系
        if(bookIds !== undefined) {
          // 验证书籍ID
          if(bookIds?.length > 0) {
            await this.validateBookIds(bookIds)
          }

          // 删除现有的关联
          await tx.learnLessionBook.deleteMany({
            where: { lessionId: id }
          })

          // 创建新关联
          if(bookIds.length > 0) {
            const lessionBookData = bookIds.map((bookId) => ({
              lessionId: id,
              bookId
            }))

            await tx.learnLessionBook.createMany({
              data: lessionBookData,
              skipDuplicates: true
            })
          }
        }

        // 3.返回更新后的完整数据
        return await tx.learnLession.findUnique({
          where: { id },
          include: {
            lessionDetail: true,
            lessionBooks: {
              include: {
                book: true
              }
            }
          }
        })
      })
    } catch (error) {
      if(error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException(`更新课程失败: ${error?.message}`)
    }
  }

  // 删除某一个课程(级联删除详情)
  async removeOne(id: number): Promise<void> {
    // 检查课程是否存在
    await this.findOne(id);

    // prisma 的 cascade 删除会自动处理关联表
    await this.prisma.learnLession.delete({
      where: { id }
    })
  }

  // 创建或更新课程详情
  async createOrUpdateDetail(lessionId: number, createLessionDetailDto: CreateLessionDetailDto) {
    // 检查课程是否存在
    await this.findOne(lessionId)

    try {
      const existingDetail = await this.prisma.learnLessionDetail.findUnique({
        where: { lessionId }
      })

      const data = {
        ...createLessionDetailDto,
      }

      if(existingDetail) {
        return await this.prisma.learnLessionDetail.update({
          where: { lessionId },
          data
        });
      } else {
        return await this.prisma.learnLessionDetail.create({
          data: {
            ...data,
            lessionId
          }
        })
      }
    } catch (error) {
      throw new InternalServerErrorException(`操作详情失败: ${error.message}`);
    }
  }

  // 获取课程详情
  async getDetail(lessionId: number) {
    const detail = await this.prisma.learnLessionDetail.findUnique({
      where: { lessionId }
    })
    if(!detail) {
      throw new NotFoundException(`课程 ${lessionId} 的详情不存在`)
    }
    return detail
  }

  // 删除课程详情
  async removeDetail(lessionId: number) {
    const detail = await this.prisma.learnLessionDetail.findUnique({
      where: { lessionId }
    })
    if(!detail) {
      throw new NotFoundException(`课程 ${lessionId} 的详情不存在`)
    }
    await this.prisma.learnLessionDetail.delete({
      where: { lessionId }
    })
  }

  // 批量创建课程关联
  async addBooksToLession(lessionId: number, bookIds: number[]): Promise<any> {
    // 检查课程是否尊在
    await this.findOne(lessionId)

    // 验证书籍ID
    if (bookIds?.length > 0) {
      await this.validateBookIds(bookIds)
    }

    try {
      return await this.prisma.$transaction(async tx => {
        // 删除现有关联
        await tx.learnLessionBook.deleteMany({
          where: { lessionId },
        });

        if(bookIds?.length > 0) {
          // 创建关联关系
          const lessionBookData = bookIds.map(bookId => ({
            lessionId,
            bookId
          }))

          await tx.learnLessionBook.createMany({
            data: lessionBookData,
            skipDuplicates: true
          })
        }
      })

      // 返回更新后的课程数据
      return await this.findOne(lessionId)
    } catch (error) {
      throw new InternalServerErrorException(`添加书籍关联失败: ${error?.message}`)
    }
  }

  // 批量查询课程详情
  async findDetailsByIds(lessionIds: number[]) {
    return this.prisma.learnLessionDetail.findMany({
      where: {
        lessionId: { in: lessionIds }
      }
    })
  }

  // 移除课程关联
  async removeBooksFromLession(lessionId: number, bookIds: number[]): Promise<any> {
    // 检查课程是否存在
    await this.findOne(lessionId)

    try {
      // 删除指定关联
      await this.prisma.learnLessionBook.deleteMany({
        where: {
          lessionId,
          bookId: { in: bookIds }
        }
      })

      // 返回更新后的课程数据
      return await this.findOne(lessionId)
    } catch (error) {
      throw new InternalServerErrorException(`移除书籍关联失败: ${error.messages}`)
    }
  }
}