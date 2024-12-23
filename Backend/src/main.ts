import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import { Logger } from '@nestjs/common';
import 'reflect-metadata';


async function bootstrap() {
  const logger = new Logger('MongoDB');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Allow frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Added PATCH and OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
    credentials: true, // Include credentials (cookies, auth headers, etc.)

  });
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
  await app.listen(process.env.PORT ?? 3001);
  logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();