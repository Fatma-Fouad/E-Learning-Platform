import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionBankSchema } from './questionbank.schema';
import { QuestionBankController } from './questionbank.controller';
import { QuestionBankService } from './questionbank.service';
import { ModuleSchema } from '../modules/module.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'questionbank', schema: QuestionBankSchema, collection: 'questionbank' },
      { name: 'modules', schema: ModuleSchema }, 
    ]),
  ],
  exports: [MongooseModule],
  controllers: [QuestionBankController],
  providers: [QuestionBankService],
})
export class QuestionBankModule {}
