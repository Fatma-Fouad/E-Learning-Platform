import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import { Logger } from '@nestjs/common';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('MongoDB');
  const app = await NestFactory.create(AppModule);


  mongoose.connection.on('connected', () => {
    logger.log('Successfully connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();