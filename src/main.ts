import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}
bootstrap();
