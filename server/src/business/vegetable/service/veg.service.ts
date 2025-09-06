import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/service/prisma/prisma.service';
import { Response } from 'express';
import { exportTable, tree } from '@/common/utils';
import { QueryVegetableDto } from "../dto/index";
import { Prisma } from '@prismaClient';
import { isNotEmpty } from 'class-validator';
import * as assert from 'assert';

@Injectable()
export class VegService {
  constructor(private prisma: PrismaService) {}

  async selectVegetableAll() {
    return this.prisma.buzVegetable.findMany();
  }
}