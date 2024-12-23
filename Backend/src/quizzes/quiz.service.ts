import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import { QuestionBankDocument } from '../questionbank/questionbank.schema';
import { User } from '../users/user.schema';
import { ProgressDocument } from '../progress/models/progress.schema';
import { ModuleDocument } from 'src/modules/module.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('questionbank') private questionBankModel: Model<QuestionBankDocument>,
    @InjectModel(User.name) private readonly usersModel: Model<User>, // Inject User schema
    @InjectModel('progress') private progressModel: Model<ProgressDocument>,
    @InjectModel('modules') private moduleModel: Model<ModuleDocument>,
  ) {}

  async generateQuiz(
    userId: string,
    moduleId: string,
    questionCount: number,
    type: string,
  ): Promise<{ message: string; quiz: QuizDocument }> {
    //if exists
    const user = await this.usersModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    //if this module has a questionbank
    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });
    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
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
      message: 'Quiz created successfully.', // Include the message here
      quiz: newQuiz,
    };
  }

  // Update an existing quiz
  async updateQuiz(
    quizId: string,
    questionCount?: number,
    type?: string,
  ): Promise<QuizDocument> {
    const updatedFields: Partial<QuizDocument> = {};
    if (questionCount) updatedFields.question_count = questionCount;
    if (type) updatedFields.type = type;

    const updatedQuiz = await this.quizModel.findByIdAndUpdate(
      quizId,
      { $set: updatedFields },
      { new: true }, // Return the updated document
    );

    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }

    return updatedQuiz;
  }

  async deleteQuizById(quizId: string): Promise<QuizDocument | null> {
    // Validate if the quiz exists
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }

    // Delete the quiz
    const deletedQuiz = await this.quizModel.findByIdAndDelete(quizId);
    return deletedQuiz;
  }

  async getQuizByModule(moduleId: string): Promise<QuizDocument | null> {
    return await this.quizModel
      .findOne({ module_id: moduleId })
      .select('-user_id'); // Excludes the `user_id` field
  }

  async getQuizForStudent(userId: string, moduleId: string): Promise<QuizDocument> {
    //making sure student has a progress documented

    const module = (await this.moduleModel.findById(moduleId)) as ModuleDocument;
    if (!module || !module.course_id) {
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }

    const courseId = module.course_id.toString();

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
