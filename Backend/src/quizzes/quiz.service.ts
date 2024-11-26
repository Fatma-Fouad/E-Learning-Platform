import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import { ModuleDocument } from '../modules/module.schema';
import { CreateQuizDto } from './createquiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('modules') private moduleModel: Model<ModuleDocument>,
  ) {}

  async create(quizData: CreateQuizDto): Promise<any> {
    
    const moduleExists = await this.moduleModel.findById(quizData.module_id);
    if (!moduleExists) {
      throw new NotFoundException(`Module with ID ${quizData.module_id} not found.`);
    }

    
    const requiredFields = ['module_id', 'questions'];
    for (const field of requiredFields) {
      if (!quizData[field]) {
        throw new BadRequestException(`Missing required field: ${field}`);
      }
    }

    
    const newQuiz = new this.quizModel({
      ...quizData,
      created_at: new Date(),
    });

    const savedQuiz = await newQuiz.save();

    //i dont want the __v in my database
    const quizObject = savedQuiz.toObject();
    delete quizObject.__v;

    return quizObject;
  }
}
