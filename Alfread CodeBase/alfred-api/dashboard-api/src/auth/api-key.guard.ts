import {  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { SecretsService } from "../aws/secrets.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger();
  @Inject(SecretsService)
  private readonly secretsService: SecretsService;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.validateRequest(context.switchToHttp().getRequest());
  }

  async validateRequest(request: any) {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      throw new HttpException(
        "Authorization header missing",
        HttpStatus.FORBIDDEN
      );
    }
    const apiKey = authorizationHeader?.split(" ")[1];

    const keys = await this.secretsService.getSecretValue(
      `${process.env.NODE_ENV}/encrypted-keys`
    );
    try {
      const secretParsed = JSON.parse(keys);
      return secretParsed.orders_api_key === apiKey;
    } catch (err) {
      console.log(`error@validate@ApiKeyGuard: `, err);
    }
    return false;
  }
}
