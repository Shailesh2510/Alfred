import { Module } from "@nestjs/common";
import { CognitoService } from "./cognito.service";
import { LambdaService } from "./lambda.service";
import { S3Service } from "./s3.service";
import { SecretsService } from "./secrets.service";
import { AppConfigService } from "./appConfig.service";

@Module({
  providers: [
    LambdaService,
    CognitoService,
    S3Service,
    SecretsService,
    AppConfigService,
  ],
  exports: [
    LambdaService,
    CognitoService,
    S3Service,
    SecretsService,
    AppConfigService,
  ],
})
export class AwsModule {}
