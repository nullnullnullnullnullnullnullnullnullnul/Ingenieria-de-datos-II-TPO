import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { Req01Controller } from './req-01/req-01.controller';
import { Req02Controller } from './req-02/req-02.controller';
import { Req03Controller } from './req-03/req-03.controller';
import { Req04Controller } from './req-04/req-04.controller';
import { Req05Controller } from './req-05/req-05.controller';
import { Req06Controller } from './req-06/req-06.controller';
import { Req07Controller } from './req-07/req-07.controller';
import { Req08Controller } from './req-08/req-08.controller';
import { Req09Controller } from './req-09/req-09.controller';
import { Req10Controller } from './req-10/req-10.controller';
import { Req11Controller } from './req-11/req-11.controller';
import { Req12Controller } from './req-12/req-12.controller';
import { Req13Controller } from './req-13/req-13.controller';
import { Req14Controller } from './req-14/req-14.controller';

/**
 * Groups the per-requirement controllers. Each one is a thin route over the
 * domain services, so they share a single module that imports the three domain
 * modules instead of one boilerplate module per requirement.
 */
@Module({
  imports: [ClientsModule, ProductsModule, InvoicesModule],
  controllers: [
    Req01Controller,
    Req02Controller,
    Req03Controller,
    Req04Controller,
    Req05Controller,
    Req06Controller,
    Req07Controller,
    Req08Controller,
    Req09Controller,
    Req10Controller,
    Req11Controller,
    Req12Controller,
    Req13Controller,
    Req14Controller,
  ],
})
export class RequirementsModule {}
