import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleSchema } from './module.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'modules', schema: ModuleSchema }])],
  exports: [MongooseModule],
})
export class ModulesModule {}
