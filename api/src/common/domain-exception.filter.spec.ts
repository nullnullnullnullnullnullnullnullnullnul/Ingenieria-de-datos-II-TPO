import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { ConflictError, DomainError, NotFoundError } from './domain-errors';

// Unit test for the domain -> HTTP mapping. Uses a minimal reply/host double, so
// it runs without a server or database.
describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  function capture(error: DomainError) {
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const host = {
      switchToHttp: () => ({ getResponse: () => reply }),
    } as unknown as ArgumentsHost;
    filter.catch(error, host);
    return reply;
  }

  it('maps NotFoundError to 404', () => {
    const reply = capture(new NotFoundError('Client not found'));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(reply.send).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Client not found',
      error: 'Not Found',
    });
  });

  it('maps ConflictError to 409', () => {
    const reply = capture(new ConflictError('clientNumber already exists'));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(reply.send).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'clientNumber already exists',
      error: 'Conflict',
    });
  });
});
