import {Controller,Get,Post,Patch,Delete,Param,Body,Res,BadRequestException,NotFoundException,UploadedFile,UseInterceptors, UseGuards} from '@nestjs/common';
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
//import { AuthGuard } from 'src/authentication/auth.guard';
//import { Roles, Role } from 'src/authentication/roles.decorator';
//import { RolesGuard } from 'src/authentication/roles.guard';




@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService, private readonly courseService: CoursesService  ) {}



  // Retrieve all modules for instructor
  @Get()
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('instructor' as Role, 'admin' as Role)
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
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('student' as Role, 'admin' as Role)
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
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('student' as Role, 'admin' as Role)
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
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('instructor' as Role, 'admin' as Role)
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
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('student' as Role, 'admin' as Role)
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
//@UseGuards(AuthGuard) 
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
   //@UseGuards(AuthGuard) 
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
   //@UseGuards(AuthGuard) 
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
//@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('instructor' as Role, 'admin' as Role)
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
//@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('instructor' as Role, 'admin' as Role)
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

  //
// *upload media
//
@Patch(':moduleId/upload')
//@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('instructor' as Role, 'admin' as Role)
@UseInterceptors(FileInterceptor('file'))
async uploadFileToModule(
  @Param('moduleId') moduleId: string,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // Max size: 10 MB
        new FileTypeValidator({ fileType: 'application/pdf|video/mp4' }), // Allow PDFs and MP4s
      ],
    }),
  )
  file: Express.Multer.File
) {
  return await this.modulesService.saveFileToModule(moduleId, file);
}
//
// *download media
//
@Get(':moduleId/download/:filename')
//@UseGuards(AuthGuard) 
  async downloadFile(
    @Param('moduleId') moduleId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // Get the file path from the module
      const filePath = await this.modulesService.getFilePathFromModule(moduleId, filename);
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found.');
      }
      // Set headers and send the file for download
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send({ message: 'Failed to download the file.' });
        }
      });
    } catch (error) {
      console.error('Error during file download:', error);
      throw new NotFoundException('Failed to download the file.');
    }
  }

 // Retrieve modules by course ID, ordered by created_at date (newest to oldest)
@Get('course/:courseId/ordered-by-date')
//@UseGuards(AuthGuard)
async getModulesByCourseOrderedByDate(@Param('courseId') courseId: string) {
  try {
    const modules = await this.modulesService.getModulesByCourseOrderedByDate(courseId);
    return {
      message: `Modules for course ID: ${courseId} retrieved and ordered by creation date (newest to oldest) successfully.`,
      data: modules,
    };
  } catch (error) {
    throw new BadRequestException(error.message || 'Failed to retrieve ordered modules by date.');
  }
}

@Patch(':id/notes-toggle')
async toggleNotes(
  @Param('id') moduleId: string,
  @Body('enabled') enabled: boolean
) {
  if (!Types.ObjectId.isValid(moduleId)) {
    throw new BadRequestException('Invalid module ID format.');
  }

  if (typeof enabled !== 'boolean') {
    throw new BadRequestException('Enabled flag must be a boolean.');
  }

  const updatedModule = await this.modulesService.toggleNotes(moduleId, enabled);

  return {
    message: `Notes have been ${enabled ? 'enabled' : 'disabled'} successfully.`,
    data: updatedModule,
  };
}

}
