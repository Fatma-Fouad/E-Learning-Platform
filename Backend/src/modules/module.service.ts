import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { modules } from './module.schema';
import { CreateModuleDto } from './createmoduleDto';
import { UpdateModuleDto } from './updatemoduleDto';
import { RateModuleDto } from './ratemoduleDto';
import { ModuleDocument } from './module.schema';
import { CourseModule } from 'src/courses/course.module';
import { CourseSchema } from 'src/courses/course.schema';
import { courses } from 'src/courses/course.schema';
import { ProgressDocument } from '../progress/progress.schema';

@Injectable()
export class ModulesService {
  constructor(
  @InjectModel('modules') private moduleModel: Model<modules>,
  @InjectModel('progress') private progressModel: Model<ProgressDocument>,
) {}

  // Retrieve all modules for instructor
  async findAll(): Promise<modules[]> {
    return this.moduleModel.find().exec();
  }  

  /**
 * Retrieve all modules for students
 */
 async findAllModulesForStudents(): Promise<modules[]> {
   try {
     // Fetch all modules where isOutdated is false, excluding previousVersions field
     return await this.moduleModel
       .find({ isModuleOutdated: false }, { modules_previousVersions: 0 }) // Exclude previousVersions field
       .exec();
   } catch (error) {
     throw new BadRequestException('Failed to retrieve modules.');
   }
 }

// async getAllModulesStudent(courseId: string): Promise<ModuleDocument[]> {
//   const modules = await this.moduleModel.find({ course_id: courseId });

//   if (!modules || modules.length === 0) {
//     throw new NotFoundException(`No modules found for course ID ${courseId}`);
//   }

//   return modules;
// }


  // // Retrieve a module by ID
  // async findById(id: string): Promise<modules> {
  //   try {
  //     const module = await this.moduleModel.findById(id).exec();
  //     if (!module) {

  //       throw new NotFoundException("Module with ID ${id} not found");
  //     }
  //     return module;
  //   } catch (error) {
  //     throw new BadRequestException("Invalid ID format or module not found: ${id}");
  //   }
  // }    //DONE

  async getModuleByIdStudent(userId: string, moduleId: string): Promise<{ module: ModuleDocument | null; message?: string }> {
    // Fetch student progress

    const module = await this.moduleModel.findById(moduleId);
    if (!module) {
    throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }

    const progress = await this.progressModel.findOne({ user_id: userId , course_id: module.course_id});
    if (!progress) {
      throw new NotFoundException(`Progress for user ID ${userId} not found.`);
    }
  
    // Determine accessible difficulty levels based on avg_score
    const avgScore = progress.avg_score || 0;
    let accessibleLevels: string[] = [];
  
    if (avgScore <= 50) {
      accessibleLevels = ['Easy'];
    } else if (avgScore <= 75) {
      accessibleLevels = ['Easy', 'Medium'];
    } else {
      accessibleLevels = ['Easy', 'Medium', 'Hard'];
    }

    if (!module) {
      return { module: null };
    }
  
    // Check if the module's difficulty is accessible
    if (!accessibleLevels.includes(module.module_difficultyLevel)) {
      const message = `You cannot access the ${module.module_difficultyLevel} module yet because your average score (${avgScore}) is not sufficient. Retake quizzes to improve your score.`;
      return { module: null, message };
    }
  
    return { module };
  }
  


  // Create a new module
  async create(createModuleDto: CreateModuleDto): Promise<modules> {
    try {
      const newModule = new this.moduleModel(createModuleDto);
      return await newModule.save();
    } catch (error) {
      throw new BadRequestException("Invalid data provided for creating a module");
    }
  }  

  // Update a module by ID
  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<modules> {
    try {
      const updatedModule = await this.moduleModel.findByIdAndUpdate(
        id,
        updateModuleDto,

        { new: true },
      ).exec();
      if (!updatedModule) {
        throw new NotFoundException(`Module with ID ${id} not found`);
      }
      return updatedModule;
    } catch (error) {
      throw new BadRequestException(`Invalid ID format or update failed for ID: ${id}`);
    }
  }   //DONE
   

  async updateModuleWithVersionControl(
    id: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<modules> {
    try {
      // Find the existing module by ID
      const existingModule = await this.moduleModel.findById(id).exec();
      if (!existingModule) {
        throw new NotFoundException('Module not found.');
      }
  
      // Mark the existing module as outdated
      existingModule.isModuleOutdated = true;
      await existingModule.save();
  
      // Prepare new module data
      const newModuleData = {
        ...existingModule.toObject(),
        ...updateModuleDto,
        module_version: existingModule.module_version + 1,
        previousVersion: existingModule._id, // Reference to the previous module
        isModuleOutdated: false, // New module is not outdated
      };
  
      // Add the current module to the modules_previousVersions array
      newModuleData.modules_previousVersions = [
        ...(existingModule.modules_previousVersions || []), // Retain existing history
        {
          _id: existingModule._id,
          title: existingModule.title,
          content: existingModule.content,
          created_at: existingModule.created_at,
          module_rating: existingModule.module_rating,
          module_ratingCount: existingModule.module_ratingCount,
          module_version: existingModule.module_version,
          isModuleOutdated: existingModule.isModuleOutdated,
        },
      ];
  
      delete newModuleData._id; // Ensure MongoDB generates a new ID
  
      // Create and save the new module
      const newModule = new this.moduleModel(newModuleData);
      return await newModule.save();
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Failed to update module with version control.');
    }
  }
  

  // Delete a module by ID
  async delete(id: string): Promise<void> {
    try {
      const result = await this.moduleModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException("Module with ID ${id} not found");
      }
    } catch (error) {
      throw new BadRequestException("Invalid ID format or delete failed for ID: ${id}");
    }
  }

  async rateModule(moduleId: string, rateModuleDto:RateModuleDto): Promise<modules> {
    try {
      const module = await this.moduleModel.findById(moduleId);
      console.log('Module:', module);
      if (!module) {
        throw new NotFoundException('Module not found.');
      }
  
      const totalRatings = module.module_ratingCount || 0;
      const currentRating = module.module_rating || 0;
  
      console.log('Total Ratings:', totalRatings, 'Current Rating:', currentRating);
  
      // Calculate the new average rating
      const updatedRating =
        (currentRating * totalRatings + rateModuleDto.module_rating) / (totalRatings + 1);
  
      // Update the module's rating fields
      module.module_rating = updatedRating;
      module.module_ratingCount = totalRatings + 1;
  
      return await module.save();
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Failed to rate the module.');
    }
  }
  async getModulesByCourseId(courseId: string): Promise<ModuleDocument[]> {
    try {
      const modules = await this.moduleModel
        .find({ course_id: courseId })
        .populate('course_id', 'title description') // Populate course details
        .exec();
  
      if (!modules || modules.length === 0) {
        throw new NotFoundException("No modules found for course ID ${courseId}");
      }
  
      return modules;
    } catch (error) {
      throw new BadRequestException(
        error.message || `Error retrieving modules for course ID ${courseId}`,
      );
    }
  }

  async getModulesByCourseAndDifficulty(courseId: string): Promise<{ [key: string]: ModuleDocument[] }> {
    try {
      // Retrieve all modules for the course
      const modules = await this.getModulesByCourseId(courseId);
  
      // Define the order for difficulty levels
      const difficultyOrder = ['Easy', 'Medium', 'Hard'];
  
      // Initialize an empty object with difficulty levels in the desired order
      const organizedModules = difficultyOrder.reduce((result, difficulty) => {
        result[difficulty] = [];
        return result;
      }, {} as { [key: string]: ModuleDocument[] });
  
      // Populate the organizedModules object
      modules.forEach((module) => {
        const difficulty = module.module_difficultyLevel || 'Unknown';
        if (organizedModules[difficulty]) {
          organizedModules[difficulty].push(module);
        } else {
          if (!organizedModules['Unknown']) {
            organizedModules['Unknown'] = [];
          }
          organizedModules['Unknown'].push(module);
        }
      });
  
      // Remove any empty difficulty categories
      for (const difficulty in organizedModules) {
        if (organizedModules[difficulty].length === 0) {
          delete organizedModules[difficulty];
        }
      }
  
      return organizedModules;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to organize modules by difficulty level.'
      );
    }
  }
  
}
