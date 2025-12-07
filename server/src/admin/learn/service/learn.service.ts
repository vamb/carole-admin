import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/service/prisma/prisma.service";
import { Response } from "express";
import { exportTable } from "@/common/utils";
import {
  QueryLearnDto
} from "../dto/learnDto";
import { Prisma } from "@prismaClient";
import { isNotEmpty } from 'class-validator';
import { redisUtils } from '@/common/utils/redisUtils';
import { Constants } from '@/common/constant/Constants';

@Injectable()
export class LearnService {
  constructor(private prisma: PrismaService) {}

  async selectLearnLession(q: QueryLearnDto) {
    const queryCondition: Prisma.LearnLessionWhereInput = {};

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
}