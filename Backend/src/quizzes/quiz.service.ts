import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import { QuestionBankDocument } from '../questionbank/questionbank.schema';
import { UserDocument } from '../users/user.schema';
import { ProgressDocument } from '../progress/models/progress.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('questionbank') private questionBankModel: Model<QuestionBankDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('progress') private progressModel: Model<ProgressDocument>,
  ) {}

  async generateQuiz(
    userId: string,
    moduleId: string,
    questionCount: number,
    type: string,
  ): Promise<{ message: string; quiz: QuizDocument }> {
    //if exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    //if this module has a questionbank
    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });
    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    //check if quiz for this module exists
    const existingQuiz = await this.quizModel.findOne({ module_id: moduleId, user_id: userId });
    if (existingQuiz) {
      await this.quizModel.deleteOne({ module_id: moduleId, user_id: userId });
    }

    const newQuiz = new this.quizModel({
      user_id: userId,
      module_id: moduleId,
      questions: [],
      question_count: questionCount,
      type,
      created_at: new Date(),
    });

    await newQuiz.save();

    return {
      message: existingQuiz
        ? 'Old quiz deleted. New quiz generated successfully.'
        : 'Quiz generated successfully.',
      quiz: newQuiz,
    };
  }

  async getQuizForStudent(userId: string,courseId: string, moduleId: string): Promise<QuizDocument> {
    //making sure student has a progress documented
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
    const instructorQuiz = await this.quizModel.findOne({
      module_id: moduleId,
    })
      .populate({
        path: 'user_id',
        match: { role: 'instructor' },
      })
      .exec();
  
    if (!instructorQuiz) {
      throw new NotFoundException(`No instructor quizzes available for module ID ${moduleId}`);
    }

    const questionCount = instructorQuiz.question_count;
    const type = instructorQuiz.type;

    //get the questions from the question bank for this module
    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });
    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    //filter questions by type and difficulty
    let filteredQuestions = questionBank.questions.filter((q) => difficultyLevels.includes(q.difficulty));
    if (type !== 'both') {
      filteredQuestions = filteredQuestions.filter((q) => q.type === type);
    }

    //ensure there are enough questions available
    if (filteredQuestions.length < questionCount) {
      throw new NotFoundException('Not enough questions available to generate a quiz.');
    }

    //select random questions
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    const studentQuiz = new this.quizModel({
      user_id: userId,
      module_id: moduleId,
      questions: selectedQuestions,
      question_count: questionCount,
      type: type,
      created_at: new Date(),
    });

    return await studentQuiz.save();
  }
}
