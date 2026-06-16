/**
 * Domain (business) errors. They carry no HTTP knowledge; the
 * DomainExceptionFilter translates them into HTTP responses at the edge. This
 * keeps the service layer decoupled from the transport.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** A requested entity does not exist. Mapped to HTTP 404. */
export class NotFoundError extends DomainError {}

/** An operation conflicts with the current state (e.g. duplicate key). Mapped to HTTP 409. */
export class ConflictError extends DomainError {}
