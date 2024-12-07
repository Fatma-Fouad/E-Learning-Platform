import {Controller,Get,Post,Patch,Delete,Param,Body,Res,BadRequestException,NotFoundException,UploadedFile,UseInterceptors} from '@nestjs/common';
import { ModulesService } from './module.service';
import { CreateModuleDto } from './createmoduleDto';
import { UpdateModuleDto } from './updatemoduleDto';
import { RateModuleDto } from './ratemoduleDto';
import { Types } from 'mongoose';
import { CourseModule } from 'src/courses/course.module';
import { CourseSchema } from 'src/courses/course.schema';
import { courses } from 'src/courses/course.schema';
import { ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { CoursesService } from 'src/courses/course.service';
import { QuestionBankDocument } from '../questionbank/questionbank.schema';
import { QuizDocument } from '../quizzes/quiz.schema';




@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService, private readonly courseService: CoursesService  ) {}



  // Retrieve all modules for instructor
  @Get()
  async findAll() {
    try {
      return await this.modulesService.findAll();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve modules.');
    }
  }

  /**
   * Retrieve all modules for students
   */
  @Get()
   async findAllModulesForStudents() {
     try {
       return await this.modulesService.findAllModulesForStudents();
     } catch (error) {
       throw new BadRequestException(
         error.message || 'Failed to retrieve modules for students.',
       );
     }
  }

    //old jana implementatiom
//   @Get('student')
//   async getAllModulesStudent(@Body('course_id') courseId: string) {
//   if (!courseId) {
//     throw new BadRequestException('course_id is required.');
//   }

//   const modules = await this.modulesService.getAllModulesStudent(courseId);

//   return {
//     message: 'Modules retrieved successfully',
//     modules,
//   };
// }

    //old id replaced by diffculty 
  // @Get(':id')
  // async findById(@Param('id') id: string) {
  //   if (!this.isValidObjectId(id)) {
  //     throw new BadRequestException('Invalid module ID format.');
  //   }
  //   const module = await this.modulesService.findById(id);
  //   if (!module) {
  //     throw new NotFoundException("Module with ID ${id} not found.");
  //   }
  //   return module;
  // }

  @Get(':id/student')
  async getModuleByIdStudent(
    @Param('id') moduleId: string,
    @Body('user_id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('user_id is required.');
    }

    const module = await this.modulesService.getModuleByIdStudent(userId, moduleId);
    if (!module) {
      throw new NotFoundException("Module with ID ${id} not found.");
    }

    return {
      message: 'Module retrieved successfully',
      module,
    };
  }

  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    try {
      return await this.modulesService.create(createModuleDto);
    } catch (error) {
      throw new BadRequestException('Failed to create module.');
    }
  }


  // /**
  //  * Update a module with version control
  //  */
  // @Patch(':id/version-control')
  // async updateModuleWithVersionControl(
  //   @Param('id') id: string,
  //   @Body() updateModuleDto: UpdateModuleDto,
  // ) {
  //   try {
  //     return await this.modulesService.updateModuleWithVersionControl(id, updateModuleDto);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to update module with version control.');
  //   }
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   if (!this.isValidObjectId(id)) {
  //     throw new BadRequestException('Invalid module ID format.');
  //   }
  //   try {
  //     return await this.modulesService.delete(id);
  //   } catch (error) {
  //     throw new BadRequestException(error.message || 'Failed to delete the module.');
  //   }
  // }

  @Patch(':id/rate')
  async rateModule(
    @Param('id') id: string,
    @Body() rateModuleDto: RateModuleDto,
  ) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid module ID format.');
    }
    try {
      const updatedModule = await this.modulesService.rateModule(id, rateModuleDto);
      return {
        message: 'Module rated successfully',
        moduleId: id,
        newRating: updatedModule.module_rating,
        ratingCount: updatedModule.module_ratingCount,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException(error.message || 'Failed to rate the module.');
    }
  }
 // Utility method to validate MongoDB ObjectId format
 private isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}


@Get('course/:courseId')
async getModulesByCourseId(@Param('courseId') courseId: string) {
  if (!this.isValidObjectId(courseId)) {
    throw new BadRequestException('Invalid course ID format.');
  }
  try {
    const modules = await this.modulesService.getModulesByCourseId(courseId);
    return {
      message: `Modules retrieved for course ID: ${courseId}`,
      data: modules,
    };
  } catch (error) {
    throw new BadRequestException(error.message || 'Failed to retrieve modules.');
  }
}

   // Retrieve all modules ordered by module_order
   @Get('ordered')
   async findAllOrdered() {
     try {
       const modules = await this.modulesService.findAllOrdered();
       return {
         message: 'Modules retrieved and ordered by module_order successfully.',
         data: modules,
       };
     } catch (error) {
       throw new BadRequestException('Failed to retrieve ordered modules.');
     }
   }
 
   // Retrieve modules by course ID, ordered by module_order
   @Get('course/:courseId/ordered')
   async getModulesByCourseOrdered(@Param('courseId') courseId: string) {
     try {
       const modules = await this.modulesService.getModulesByCourseOrdered(courseId);
       return {
         message: `Modules for course ID: ${courseId} retrieved and ordered by module_order successfully.`,
         data: modules,
       };
     } catch (error) {
       throw new BadRequestException(error.message || 'Failed to retrieve ordered modules.');
     }
   }
 
/**
 * Update a module with version control and update related references in questionBank and quizzes
 */
@Patch(':id/version-control')
async updateModuleWithVersionControl(
  @Param('id') id: string,
  @Body() updateModuleDto: UpdateModuleDto,
) {
  if (!this.isValidObjectId(id)) {
    throw new BadRequestException('Invalid module ID format.');
  }

  try {
    // Call the service to update the module and related references
    const updatedModule = await this.modulesService.updateModuleWithVersionControl(id,updateModuleDto);
    return {
      message: 'Module updated with version control successfully.',
      updatedModule,
    };
  } catch (error) {
    console.error('Error in updateModuleWithVersionControl:', error);
    throw new BadRequestException(
      error.message || 'Failed to update module with version control.',
    );
  }
}

@Get(':id')
async getModuleById(@Param('id') id: string) {
    if (!this.isValidObjectId(id)) {
        throw new BadRequestException('Invalid module ID format.');
    }
    try {
        const module = await this.modulesService.getModuleById(id);
        if (!module) {
            throw new NotFoundException(`Module with ID ${id} not found.`);
        }
        return {
            message: `Module with ID ${id} retrieved successfully.`,
            data: module,
        };
    } catch (error) {
        throw new BadRequestException(error.message || 'Failed to retrieve module.');
    }
}

}
