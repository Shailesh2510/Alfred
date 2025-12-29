import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger();
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let exceptionResponse = 'Unknown error';
    if (exception instanceof QueryFailedError) {
      this.logger.error(`[QueryFailedErr]: ${exception.message}`)
      httpStatus = 409
      exceptionResponse = 'Conflict: data integrity error'
    }

    this.logger.log(`[AllExceptionsFilter]: ${exception} - message ${exception.message}`);
    this.logger.log(`Stacktrace: ${exception.stack}`)

    try {
      exceptionResponse = exception.getResponse().hasOwnProperty('message')
        ? //@ts-ignore
          exception.getResponse().message
        : exception.getResponse();
    } catch (err) {
      console.log('[exception-parse-error]: ', exception);
    }

    response.status(httpStatus).json({
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exceptionResponse,
    });
  }
}
