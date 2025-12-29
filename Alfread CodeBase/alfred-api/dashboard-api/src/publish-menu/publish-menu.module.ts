import { Module } from "@nestjs/common";
import { publishMenuProviders } from "./publish-menu.providers";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { TenantPublishMenuController } from "./publish-menu.tenant.controller";
import { AwsModule } from "../aws/aws.module";
import { HotelModule } from "../hotel/hotel.module";
import { PublishMenuService } from "./publish-menu.service";
import { HotelPublishMenuController } from "./publish-menu.hotel.controller";
import { MenuModule } from "../menu/menu.module";

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule, HotelModule, MenuModule],
  controllers: [TenantPublishMenuController, HotelPublishMenuController],
  providers: [PublishMenuService, ...publishMenuProviders],
  exports: [PublishMenuService],
})
export class PublishMenuModule {}
