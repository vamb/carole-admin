import { Controller, Get, Post, Req } from '@nestjs/common';
import Result from '@/common/result/Result';
import { ExtService } from "./service/ext.service";

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
  async workStateChange(@Req() req) {
    console.log('workStateChange req?.query?.workState', req?.query?.workstate)
    const newWorkState = req?.query?.workstate
    this.extService.setWorkState(newWorkState)
    return {
      ...Result.ok(),
      workState: this.extService.getWorkState()
    }
  }

}