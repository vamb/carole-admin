import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "@/common/service/prisma/prisma.service";
import { Response } from "express";
import { exportTable, nowDateTime } from '@/common/utils';
import {
  QueryLessionDto, CreateLessionDto, UpdateLessionDto,
  CreateLessionBookDto, UpdateLessionBookDto,
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
    const result = await this.prisma.$transaction(async (tx) => {

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
          lessionBooks: {
            include: {
              book: true,
            },
          },
        },
      });
    });
    return result
  }

  async findAllLession(): Promise<LearnLession[]> {
    return this.prisma.learnLession.findMany({
      include: {
        lessionBooks: {
          include: {
            book: true
          }
        }
      }
    })
  }

  async findOne(id: number): Promise<any> {
    const lession = await this.prisma.learnLession.findUnique({
      where: { id },
      include: {
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

  async updateLearnLessionBook(id: number, updateLessionBookDto: UpdateLessionBookDto): Promise<any> {
    await this.findOne(id)

    const { bookIds, ...updateData } = updateLessionBookDto

    return await this.prisma.$transaction(async tx => {

      const updatedLession = await tx.learnLession.update({
        where: { id },
        data: updateData
      })

      if(bookIds !== undefined) {
        await tx.learnLessionBook.deleteMany({
          where: { lessionId: id }
        })

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

      return await tx.learnLession.findUnique({
        where: { id },
        include: {
          lessionBooks: {
            include: {
              book: true
            }
          }
        }
      })
    })
  }
}