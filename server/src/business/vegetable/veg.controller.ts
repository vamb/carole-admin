import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ParseIntArrayPipe } from '@/common/pipe/parse-int-array.pipe';
import Result from '@/common/result/Result';
import { RequirePermission } from '@/common/decorator/require-premission.decorator';
import { nowDateTime } from '@/common/utils';
import { VegService } from "./service/veg.service";
import { Response } from 'express';
import { QueryVegetableDto } from "./dto/index";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller("/buz/vegetable")
export class VegController {
  constructor(private vegService: VegService) {}

  @Get("/list")
  async findAllVeg() {
    return await this.vegService.selectVegetableAll();
  }
}