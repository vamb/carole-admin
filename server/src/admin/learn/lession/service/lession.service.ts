import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/service/prisma/prisma.service";
import { Response } from "express";
import { exportTable } from "@/common/utils";
import {
  QueryLessionDto, CreateLessionDto, UpdateLessionDto,
  CreateLessionBookDto,
} from '../dto/lessionDto';
import { Prisma } from "@prismaClient";
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
}