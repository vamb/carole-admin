import { Controller, Get, Post, Req, Body } from '@nestjs/common';
import Result from '@/common/result/Result';
import { ExtService } from "./service/ext.service";
import { WorkStateChangeDto } from "./dto/index";

@Controller("/ext")
export class ExtController {
  constructor(private extService: ExtService) {}

  @Get("/getWorkState")
  async getWorkState() {
    return {
      ...Result.ok(),
      workState: this.extService.getWorkState()
    }
  }

  @Post("/postXPathData")
  async postXPathData(@Req() req) {
    console.log('postXPathData req?.query', req?.query)
    this.extService.setWorkState("SELECTED")
    return {
      ...Result.ok(),
      postData: req?.query
    }
  }

  @Post("/workStateChange")
  async workStateChange(@Body() workStateChangeDto: WorkStateChangeDto) {
    this.extService.setWorkState(workStateChangeDto?.workState)
    return {
      ...Result.ok(),
      workState: this.extService.getWorkState()
    }
  }

}