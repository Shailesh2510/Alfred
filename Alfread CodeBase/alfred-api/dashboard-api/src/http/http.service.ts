import { Injectable } from "@nestjs/common";
import * as fetch from "node-fetch";

@Injectable()
export class HTTPService {
  async request(input: RequestInfo, init?: RequestInit) {
    try {
      //@ts-ignore
      return await fetch.default(input, init);
    } catch (err) {
      console.log(`error@HTTPService: `, err)
    }
  }
}
