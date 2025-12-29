import { Module } from "@nestjs/common";
import { HTTPService } from "./http.service";

@Module({
  imports: [],
  controllers: [],
  providers: [HTTPService],
  exports: [HTTPService]
})
export class HTTPModule {}
