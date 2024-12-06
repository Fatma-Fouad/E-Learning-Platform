import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './course.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'courses', schema: CourseSchema }])],
  exports: [MongooseModule],
})
export class CourseModule {}
