import { Injectable } from '@nestjs/common';

// OFF || SELECTED || ON
@Injectable()
export class ExtService {
  private workState = "OFF";

  getWorkState() {
    return this.workState;
  }

  setWorkState(workState: string) {
    console.log('setWorkState workState', workState)
    this.workState = workState
    return this.workState;
  }
}