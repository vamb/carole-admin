import { Module } from "@nestjs/common";
import { VegController } from "./vegetable/veg.controller";

import { VegService } from "./vegetable/service/veg.service";

@Module({
  imports: [],
  controllers: [
    VegController
  ],
  providers: [
    VegService
  ]
})
export class BuzModule {}