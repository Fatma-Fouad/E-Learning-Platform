import { ModuleDocument } from '../modules/module.schema';

export class CreateQuestionBankDto {
    module_id: string; 
    questions: {
      question_id: string;
      question_text: string;
      options: string[];
      correct_answer: string;
      difficulty: 'easy' | 'medium' | 'hard';
      type: 'mcq' | 'tf';
    }[];
  }
  