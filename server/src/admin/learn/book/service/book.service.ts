import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/service/prisma/prisma.service";
import { Response } from "express";
import { exportTable } from "@/common/utils";
import {
  QueryBootDto, CreateBookDto, UpdateBookDto
} from "../dto/bootDto";
import { Prisma } from "@prismaClient";
import { isNotEmpty } from 'class-validator';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async selectLearnBook(q: QueryBootDto) {
    const queryCondition: Prisma.LearnBookWhereInput = {};

    if (isNotEmpty(q["id"])) {
      queryCondition.id = {
        equals: q.id
      }
    }

    if (isNotEmpty(q["name"])) {
      queryCondition.name = {
        contains: q.name
      }
    }

    if (isNotEmpty(q["remark"])) {
      queryCondition.remark = {
        contains: q.remark
      }
    }
    return {
      rows: await this.prisma.learnBook.findMany({
        skip: (q.pageNum - 1) * q.pageSize,
        take: q.pageSize,
        where: queryCondition,
      }),
      total: await this.prisma.learnBook.count({
        where: queryCondition
      })
    }
  }

  async addLearnBook(learnBook: CreateBookDto) {
    //删除掉空值
    for (const key in learnBook) {
      !isNotEmpty(learnBook[key]) && delete learnBook[key];
    }
    const d = await this.prisma.learnBook.create({
      data: learnBook
    })
    return d
  }

  async updateLearnBook(learnBook: UpdateBookDto) {
    //删除掉空值
    for (const key in learnBook) {
      !isNotEmpty(learnBook[key]) && delete learnBook[key];
    }
    await this.prisma.learnBook.update({
      where: {
        id: learnBook.id
      },
      data: learnBook
    })
    return true
  }

  async deleteLearnBookIds(learnBookIds: number[]) {
    const r = await this.prisma.learnBook.deleteMany({
      where: {
        id: {
          in: learnBookIds
        }
      }
    })
    return r;
  }

}