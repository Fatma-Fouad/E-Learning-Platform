import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { ProgressSchema } from './progress.schema';
import { CourseSchema } from '../../courses/course.schema';
import { ModuleSchema } from '../../modules/module.schema';
import { UserSchema } from '../../users/user.schema';

@Module({
  imports: [
    // Import Mongoose schemas for the `progress`, `course`, and `module` collections
    MongooseModule.forFeature([
      { name: 'progress', schema: ProgressSchema },
      { name: 'user', schema: UserSchema },
      { name: 'course', schema: CourseSchema },
      { name: 'module', schema: ModuleSchema },
    ]),
  ],
  controllers: [ProgressController], // Register the ProgressController
  providers: [ProgressService], // Register the ProgressService
})
export class ProgressModule {}
