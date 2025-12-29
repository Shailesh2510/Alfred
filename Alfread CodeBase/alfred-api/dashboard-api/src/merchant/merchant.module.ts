import { Module } from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { TenantMerchantController } from "./merchant.tenant.controller";
import { merchantProviders } from "./merchant.providers";
import { DatabaseModule } from "database/database.module";
import { AuthModule } from "../auth/auth.module";
import { CityModule } from "../city/city.module";
import { MerchantController } from "./merchant.merchant.controller";
import { MerchantColorService } from "./merchant-color.service";
import { S3Service } from "src/aws/s3.service";

@Module({
  imports: [DatabaseModule, AuthModule, CityModule],
  controllers: [TenantMerchantController, MerchantController],
  providers: [
    MerchantService,
    MerchantColorService,
    S3Service,
    ...merchantProviders,
  ],
  exports: [MerchantService],
})
export class MerchantModule {}
