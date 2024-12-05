import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleSchema } from './module.schema';
import { ModulesController } from './module.controller';
import { ModulesService } from './module.service';
import { CourseSchema } from '../courses/course.schema';
import { courses } from '../courses/course.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'modules', schema: ModuleSchema },{ name: 'courses', schema: CourseSchema }])],
  exports: [MongooseModule],
  controllers: [ModulesController],
  providers: [ModulesService],

})
export class ModulesModule {}