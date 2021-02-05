import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import { HttpsFunction, https } from 'firebase-functions';

const server = express();

async function bootstrap(expressInstance) {
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    {},
  );
  app.enableCors();
  return app.init();
}

bootstrap(server)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

export const api: HttpsFunction = https.onRequest(server);
