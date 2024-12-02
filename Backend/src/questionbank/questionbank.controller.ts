import { Controller, Param, Post, Patch, Body , Get, NotFoundException} from '@nestjs/common';
import { QuestionBankService } from './questionbank.service';
import { CreateQuestionBankDto } from './createquestionbank.dto';
import { UpdateQuestionBankDto } from './updatequestionbank.dto';

@Controller('questionbank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  async createQuestionBank(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    const { module_id, questions } = createQuestionBankDto;
    const questionBank = await this.questionBankService.createQuestionBank(module_id, questions);
    return {
      message: 'Question bank created successfully',
      questionBank,
    };
  }

  @Patch()
  async updateQuestionBank(@Body() updateQuestionBankDto: UpdateQuestionBankDto) {
    const { module_id, questions } = updateQuestionBankDto;
    const updatedQuestionBank = await this.questionBankService.updateQuestionBank(module_id, questions);
    return {
      message: 'Question bank updated successfully',
      questionBank: updatedQuestionBank,
    };
  }

  @Get(':moduleId')
  async getQuestionBank(@Param('moduleId') moduleId: string) {
    const questionBank = await this.questionBankService.getQuestionBank(moduleId);

    if (!questionBank) {
      throw new NotFoundException(`No question bank found for module ID ${moduleId}`);
    }

    return {
      message: 'Question bank retrieved successfully',
      questionBank,
    };
  }
}
