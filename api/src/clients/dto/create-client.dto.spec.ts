import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateClientDto } from './create-client.dto';

// Unit test for the CreateClientDto validation rules. Runs without a database,
// so it works in any environment (including CI without Mongo/Postgres).
describe('CreateClientDto', () => {
  const base = {
    clientNumber: 1,
    name: 'Jacob',
    lastName: 'Cooper',
    address: 'Calle Falsa 123',
    active: 1,
    phones: [{ areaCode: 11, phoneNumber: 4555000, type: 'M' }],
  };

  const errorsFor = (payload: unknown) =>
    validateSync(plainToInstance(CreateClientDto, payload), {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

  it('accepts a well-formed client', () => {
    expect(errorsFor(base)).toHaveLength(0);
  });

  it('accepts a client without phones (optional)', () => {
    const noPhones: Record<string, unknown> = { ...base };
    delete noPhones.phones;
    expect(errorsFor(noPhones)).toHaveLength(0);
  });

  it('rejects clientNumber < 1', () => {
    expect(errorsFor({ ...base, clientNumber: 0 }).length).toBeGreaterThan(0);
  });

  it('rejects a non-integer clientNumber', () => {
    expect(errorsFor({ ...base, clientNumber: 1.5 }).length).toBeGreaterThan(0);
  });

  it('rejects a missing required field', () => {
    const noName: Record<string, unknown> = { ...base };
    delete noName.name;
    expect(errorsFor(noName).length).toBeGreaterThan(0);
  });

  it('rejects a phone type outside the F/M enum', () => {
    const payload = {
      ...base,
      phones: [{ areaCode: 11, phoneNumber: 4555000, type: 'X' }],
    };
    expect(errorsFor(payload).length).toBeGreaterThan(0);
  });
});
