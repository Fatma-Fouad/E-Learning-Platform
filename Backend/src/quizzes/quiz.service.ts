import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import { QuestionBankDocument } from '../questionbank/questionbank.schema';
import { UserDocument } from '../users/user.schema';
import { ProgressDocument } from '../progress/progress.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('questionbank') private questionBankModel: Model<QuestionBankDocument>,
    @InjectModel('users') private userModel: Model<UserDocument>,
    @InjectModel('progress') private progressModel: Model<ProgressDocument>,
  ) {}

  async generateQuiz(
    userId: string,
    moduleId: string,
    questionCount: number,
    type: string, 
  ): Promise<QuizDocument> {

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    
    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });
    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    let filteredQuestions = questionBank.questions;
    if (type !== 'both') {
      filteredQuestions = filteredQuestions.filter((q) => q.type === type);
    }

    if (filteredQuestions.length < questionCount) {
      throw new BadRequestException('Not enough questions available to generate the quiz.');
    }

    //random select
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount)
      .map((question) => ({
        question_id: question.question_id, //get the og question id in the question bank
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        difficulty: question.difficulty,
        type: question.type,
      }));

    const newQuiz = new this.quizModel({
      user_id: userId,
      module_id: moduleId,
      questions: selectedQuestions,
      created_at: new Date(),
    });

    return await newQuiz.save();
  }

  async getQuizForStudent(userId: string,courseId: string, moduleId: string): Promise<QuizDocument> {
    //makking sure student has a progress documented
    const progress = await this.progressModel.findOne({ user_id: userId, course_id: courseId  });
    if (!progress) {
      throw new NotFoundException(`No progress found for user ID ${userId} and course ID ${courseId}`);
    }

    //determine difficulty based on avg score
    const avgScore = progress.avg_score || 0;
    let difficultyLevels: string[] = [];
    if (avgScore <= 39) {
      difficultyLevels = ['easy'];
    } else if (avgScore <= 69) {
      difficultyLevels = ['easy', 'medium'];
    } else {
      difficultyLevels = ['medium', 'hard'];
    }

    //fetch the quiz that was done by the instructor for this module
    const instructorQuizzes = await this.quizModel.find({
      module_id: moduleId,
    })
      .populate({
        path: 'user_id',
        match: { role: 'instructor' },
      })
      .exec();
  
    if (instructorQuizzes.length === 0) {
      throw new NotFoundException(`No instructor quizzes available for module ID ${moduleId}`);
    }

    //filter questions by diffculty
    const allQuestions = instructorQuizzes.flatMap((quiz) => quiz.questions);
    const filteredQuestions = allQuestions.filter((q) => difficultyLevels.includes(q.difficulty));

    //assumed 3 questions per quiz
    const questionCount = 3;
    if (filteredQuestions.length < questionCount) {
      throw new NotFoundException('Not enough questions available to generate a quiz.');
    }

    //select random questions
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    //save the generated quiz of the student
    const studentQuiz = new this.quizModel({
      user_id: userId,
      module_id: moduleId,
      questions: selectedQuestions,
      created_at: new Date(),
    });

    return await studentQuiz.save();
  }
}
