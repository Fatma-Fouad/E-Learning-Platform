import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './createquiz.dto';

@Controller('quizzes') 
export class QuizController {
  constructor(private quizService: QuizService) {} 

  @Post() 
  async createQuiz(@Body() quizData: CreateQuizDto) {
    const newQuiz = await this.quizService.create(quizData);
    return newQuiz; 
  }
}
