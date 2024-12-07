import { Controller, Param, Post, Patch, Body , Get, Delete,NotFoundException, UseGuards} from '@nestjs/common';
import { QuestionBankService } from './questionbank.service';
import { CreateQuestionBankDto } from './createquestionbank.dto';
import { UpdateQuestionBankDto } from './updatequestionbank.dto';
import { RolesGuard } from '../authentication/roles.guard';
import { Role, Roles } from '../authentication/roles.decorator';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('questionbank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
  @Roles('admin' as Role, 'instructor' as Role)
  async createQuestionBank(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    const { module_id, questions } = createQuestionBankDto;
    const questionBank = await this.questionBankService.createQuestionBank(module_id, questions);
    return {
      message: 'Question bank created successfully',
      questionBank,
    };
  }

  @Patch()
  @UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
  @Roles('admin' as Role, 'instructor' as Role)
  async updateQuestionBank(@Body() updateQuestionBankDto: UpdateQuestionBankDto) {
    const { module_id, questions } = updateQuestionBankDto;
    const updatedQuestionBank = await this.questionBankService.updateQuestionBank(module_id, questions);
    return {
      message: 'Question bank updated successfully',
      questionBank: updatedQuestionBank,
    };
  }

  @Get(':moduleId')
  @UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
  @Roles('admin' as Role, 'instructor' as Role)
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

  @Delete()
  async deleteQuestion(@Body('module_id') moduleId: string, @Body('question_id') questionId: string) {
    if (!moduleId || !questionId) {
      throw new Error('Both module_id and question_id are required.');
    }
    return await this.questionBankService.deleteQuestion(moduleId, questionId);
  }
}
