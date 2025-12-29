import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecretsService } from '../aws/secrets.service';

@Injectable()
export class RelayApiKeyGuard implements CanActivate {
  private readonly logger = new Logger();
  @Inject(SecretsService)
  private readonly secretsService: SecretsService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.validateRequest(context.switchToHttp().getRequest());
  }

  async validateRequest(request: any) {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.FORBIDDEN,
      );
    }
    const apiKey = authorizationHeader;

    console.log(`apikey: `, apiKey)
    const keys = await this.secretsService.getSecretValue(`${process.env.NODE_ENV}/encrypted-keys`);
    console.log(`keys: `, keys)
    const secretParsed = JSON.parse(keys);
    
    return secretParsed.relay_webhook_api_key === apiKey;
  }
}
