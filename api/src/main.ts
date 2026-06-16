import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/domain-exception.filter';

/**
 * Bootstraps the NestJS application with Fastify and Swagger.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Validate and sanitize incoming request bodies against the DTOs.
  // Invalid payloads are rejected with a 400 Bad Request.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Translate domain errors thrown by the service layer into HTTP responses.
  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Billing API')
    .setDescription(
      'Billing System API with polyglot persistence (PostgreSQL + MongoDB)',
    )
    .setVersion('1.0')
    .addTag('Clients')
    .addTag('Products')
    .addTag('Invoices')
    .addTag('Requirements')
    .addTag('Cross-DB Requirements')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
