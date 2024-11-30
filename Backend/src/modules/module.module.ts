import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleSchema } from './module.schema';
import { ModulesController } from './module.controller';
import { ModulesService } from './module.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'modules', schema: ModuleSchema }])],
  exports: [MongooseModule],
  controllers: [ModulesController],
  providers: [ModulesService],

})
export class ModulesModule {}
