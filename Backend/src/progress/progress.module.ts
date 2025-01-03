import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressSchema } from './models/progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'progress', schema: ProgressSchema }]),
  ],
  exports: [MongooseModule],
})
export class ProgressModule {}
