import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionBankDocument } from './questionbank.schema';
import { ModuleDocument } from '../modules/module.schema';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectModel('questionbank') private questionBankModel: Model<QuestionBankDocument>,
    @InjectModel('modules') private moduleModel: Model<ModuleDocument>,
  ) {}

  async createQuestionBank(moduleId: string, questions: any[]): Promise<any> {

    const moduleExists = await this.moduleModel.findById(moduleId);
    if (!moduleExists) {
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('Questions array is invalid or empty.');
    }

    const newQuestionBank = new this.questionBankModel({
      module_id: moduleId,
      questions,
    });
    return await newQuestionBank.save();
  }

  async updateQuestionBank(moduleId: string, newQuestions: any[]): Promise<any> {

    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });
    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    if (!newQuestions || !Array.isArray(newQuestions) || newQuestions.length === 0) {
      throw new BadRequestException('New questions array is invalid or empty.');
    }

    questionBank.questions.push(...newQuestions);

    return await questionBank.save();
  }
  
  async getQuestionBank(moduleId: string): Promise<QuestionBankDocument | null> {
    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });

    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    return questionBank;
  }
}
