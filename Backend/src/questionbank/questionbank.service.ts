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
  async deleteQuestion(moduleId: string, questionId: string): Promise<{ message: string }> {
    //get question bank for this module
    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });

    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    //findIndex()->loops over the question array and checks if the id matches
    //if found->0 if not found->-1
    const questionIndex = questionBank.questions.findIndex(
      (question) => question.question_id.toString() === questionId,
    );

    if (questionIndex === -1) {
      throw new NotFoundException(`Question with ID ${questionId} not found.`);
    }

    //rmeove the question from the array
    questionBank.questions.splice(questionIndex, 1);

    //save the updated
    await questionBank.save();

    return { message: 'Question deleted successfully' };
  }
}
