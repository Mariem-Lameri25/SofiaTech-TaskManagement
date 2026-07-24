import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ✅ Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: false, // optional, use only if you're using cookies
  });
   // Sert les fichiers dans le dossier 'uploads'
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));


  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap();
