import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ConflictError, DomainError, NotFoundError } from './domain-errors';

/**
 * Translates domain errors thrown by the service layer into HTTP responses,
 * so the services stay transport-agnostic. The payload matches Nest's default
 * error shape ({ statusCode, message, error }).
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status = this.statusFor(exception);
    void reply.status(status).send({
      statusCode: status,
      message: exception.message,
      error: this.reasonFor(status),
    });
  }

  private statusFor(exception: DomainError): HttpStatus {
    if (exception instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (exception instanceof ConflictError) return HttpStatus.CONFLICT;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private reasonFor(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }
}
