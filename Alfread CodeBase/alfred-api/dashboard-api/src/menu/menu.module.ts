import { Module } from "@nestjs/common";
import { MenuService } from "./menu.service";
import { menuProviders } from "./menu.providers";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { TenantMenuController } from "./menu.tenant.controller";
import { AwsModule } from "../aws/aws.module";
import { ItemModule } from "../item/item.module";
import { HotelMenuController } from "./menu.hotel.controller";
import { PublicMenuController } from "./menu.public.controller";
import { CityModule } from "src/city/city.module";

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule, ItemModule, CityModule],
  controllers: [
    TenantMenuController,
    HotelMenuController,
    PublicMenuController,
  ],
  providers: [MenuService, ...menuProviders],
  exports: [MenuService],
})
export class MenuModule {}
