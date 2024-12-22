
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
import * as fs from 'fs';
import * as path from 'path';
import { ProgressDocument } from '../progress/models/progress.schema';
import { Types } from 'mongoose';
import { QuestionBankDocument } from '../questionbank/questionbank.schema'; // QuestionBank document type
import { QuizDocument } from '../quizzes/quiz.schema'; // Quiz document type

@Injectable()
export class ModulesService {
  private readonly uploadDir: string;
  constructor(@InjectModel('modules') private moduleModel: Model<modules>,
  @InjectModel('progress') private progressModel: Model<ProgressDocument>,
  @InjectModel('questionbank') private questionBankModel: Model<QuestionBankDocument>,
  @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
  @InjectModel('courses') private readonly courseModel: Model<courses>,
) {
  this.uploadDir = './uploads'; // Define the directory here
}

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
    // Fetch the module by ID
    const module = await this.moduleModel.findById(moduleId);
  
    console.log('Module Retrieved:', module);
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }
  
    // Extract difficulty level, handling both correctly named and incorrectly spaced keys
    const moduleDifficulty = module.module_difficultyLevel?.trim() || module[' module_difficultyLevel']?.trim();
    console.log('Module Difficulty Level:', moduleDifficulty);
  
    if (!moduleDifficulty) {
      throw new BadRequestException(`Module difficulty level is missing for module ID ${moduleId}.`);
    }
  
    // Fetch student progress
    const progress = await this.progressModel.findOne({ user_id: userId, course_id: module.course_id });
    console.log('Progress Retrieved:', progress);
    if (!progress) {
      throw new NotFoundException(`Progress for user ID ${userId} not found.`);
    }
  
    // Determine accessible difficulty levels based on avg_score
    const avgScore = progress.avg_score || 0;
    console.log('User Average Score:', avgScore);
  
    let accessibleLevels: string[] = [];
    if (avgScore <= 50) {
      accessibleLevels = ['Easy'];
    } else if (avgScore <= 75) {
      accessibleLevels = ['Easy', 'Medium'];
    } else {
      accessibleLevels = ['Easy', 'Medium', 'Hard'];
    }
    console.log('Accessible Levels:', accessibleLevels);
  
    // Check if the module's difficulty is accessible
    if (!accessibleLevels.includes(moduleDifficulty)) {
      const message = `You cannot access the ${moduleDifficulty} module yet because your average score (${avgScore}) is not sufficient. Retake quizzes to improve your score.`;
      console.log('Access Denied Message:', message);
      return { module: null, message };
    }
  
    return { module };
  }
  
  
  
  


  // // Create a new module
  // async create(createModuleDto: CreateModuleDto): Promise<modules> {
  //   try {
  //     const newModule = new this.moduleModel(createModuleDto);
  //     return await newModule.save();
  //   } catch (error) {
  //     throw new BadRequestException("Invalid data provided for creating a module");
  //   }
  // }  

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
   

  // async updateModuleWithVersionControl(
  //   id: string,
  //   updateModuleDto: UpdateModuleDto,
  // ): Promise<modules> {
  //   try {
  //     // Find the existing module by ID
  //     const existingModule = await this.moduleModel.findById(id).exec();
  //     if (!existingModule) {
  //       throw new NotFoundException('Module not found.');
  //     }
  
  //     // Mark the existing module as outdated
  //     existingModule.isModuleOutdated = true;
  //     await existingModule.save();
  
  //     // Prepare new module data
  //     const newModuleData = {
  //       ...existingModule.toObject(),
  //       ...updateModuleDto,
  //       module_version: existingModule.module_version + 1,
  //       previousVersion: existingModule._id, // Reference to the previous module
  //       isModuleOutdated: false, // New module is not outdated
  //     };
  
  //     // Add the current module to the modules_previousVersions array
  //     newModuleData.modules_previousVersions = [
  //       ...(existingModule.modules_previousVersions || []), // Retain existing history
  //       {
  //         _id: existingModule._id,
  //         title: existingModule.title,
  //         content: existingModule.content,
  //         created_at: existingModule.created_at,
  //         module_rating: existingModule.module_rating,
  //         module_ratingCount: existingModule.module_ratingCount,
  //         module_version: existingModule.module_version,
  //         isModuleOutdated: existingModule.isModuleOutdated,
  //       },
  //     ];
  
  //     delete newModuleData._id; // Ensure MongoDB generates a new ID
  
  //     // Create and save the new module
  //     const newModule = new this.moduleModel(newModuleData);
  //     return await newModule.save();
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new BadRequestException('Failed to update module with version control.');
  //   }
  // }
  

  // Delete a module by ID
  // async delete(id: string): Promise<void> {
  //   try {
  //     const result = await this.moduleModel.findByIdAndDelete(id).exec();
  //     if (!result) {
  //       throw new NotFoundException("Module with ID ${id} not found");
  //     }
  //   } catch (error) {
  //     throw new BadRequestException("Invalid ID format or delete failed for ID: ${id}");
  //   }
  // }

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


//
//*upload media
//

async saveFileToModule(moduleId: string, file: Express.Multer.File): Promise<{ message: string; filePath: string }> {
  try {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // Ensure the uploads directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Construct the file path
    const filePath = path.join(this.uploadDir, file.originalname);

    // Save the file to the server
    fs.writeFileSync(filePath, file.buffer);

    // Find the module by ID
    const module = await this.moduleModel.findById(moduleId).exec();
    if (!module) {
      throw new NotFoundException('Module not found.');
    }

    // Append the file path to the content array
    module.content.push(filePath);
    await module.save();

    return {
      message: 'File uploaded successfully and content updated.',
      filePath,
    };
  } catch (error) {
    console.error('Error saving file to module:', error);
    throw new BadRequestException('Failed to upload file to module.');
  }
}

//
// *download media
//
async getFilePathFromModule(moduleId: string, filename: string): Promise<string> {
  // Find the module by ID
  const module = await this.moduleModel.findById(moduleId).exec();
  if (!module) {
    throw new NotFoundException('Module not found.');
  }

  // Ensure the file exists in the module's content array
  const filePath = module.content.find((file) => path.basename(file) === filename);
  if (!filePath) {
    throw new NotFoundException('File not found in module content.');
  }

  return filePath;
}

  // Retrieve all modules ordered by module_order in ascending order
  async findAllOrdered(): Promise<ModuleDocument[]> {
    try {
      return await this.moduleModel.find().sort({ module_order: 1 }).exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve modules ordered by module_order.');
    }
  }

  // Retrieve modules for a specific course, ordered by module_order in ascending order
  // async getModulesByCourseOrdered(courseId: string): Promise<ModuleDocument[]> {
  //   try {
  //     if (!Types.ObjectId.isValid(courseId)) {
  //       throw new BadRequestException('Invalid course ID format.');
  //     }

  //     const modules = await this.moduleModel
  //       .find({ course_id: courseId })
  //       .sort({ module_order: 1 }) // Ascending order
  //       .exec();

  //     if (!modules || modules.length === 0) {
  //       throw new NotFoundException(`No modules found for course ID ${courseId}.`);
  //     }

  //     return modules;
  //   } catch (error) {
  //     throw new BadRequestException(
  //       error.message || `Error retrieving modules for course ID ${courseId}.`
  //     );
  //   }
  // }

// async updateModuleWithVersionControl(
//   id: string,
//   updateModuleDto: UpdateModuleDto,
// ): Promise<modules> {
//   try {
//     // Find the existing module by ID
//     const existingModule = await this.moduleModel.findById(id).exec();
//     if (!existingModule) {
//       throw new NotFoundException('Module not found.');
//     }

//     // Mark the existing module as outdated
//     existingModule.isModuleOutdated = true;
//     await existingModule.save();

//     // Prepare new module data
//     const newModuleData = {
//       ...existingModule.toObject(),
//       ...updateModuleDto,
//       module_version: existingModule.module_version + 1,
//       previousVersion: existingModule._id, // Reference to the previous module
//       isModuleOutdated: false, // New module is not outdated
//     };

//     delete newModuleData._id; // Ensure MongoDB generates a new ID

//     // Create and save the new module
//     const newModule = new this.moduleModel(newModuleData);
//     const savedModule = await newModule.save();

//     // Update question banks with the new module ID
//     const questionBankUpdateResult = await this.questionBankModel.updateMany(
//       { module_id: id }, // Match the old module ID
//       { $set: { module_id: savedModule._id } }, // Replace with the new module ID
//     );
//     console.log(
//       `Updated ${questionBankUpdateResult.modifiedCount} question banks to new module ID.`,
//     );

//     // Update quizzes with the new module ID
//     const quizzesUpdateResult = await this.quizModel.updateMany(
//       { module_id: id }, // Match the old module ID
//       { $set: { module_id: savedModule._id } }, // Replace with the new module ID
//     );
//     console.log(
//       `Updated ${quizzesUpdateResult.modifiedCount} quizzes to new module ID.`,
//     );
     
//     return savedModule;
//   } catch (error) {
//     console.error('Error:', error);
//     throw new BadRequestException('Failed to update module with version control.');
//   }
// }

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

    delete newModuleData._id; // Ensure MongoDB generates a new ID

    // Create and save the new module
    const newModule = new this.moduleModel(newModuleData);
    const savedModule = await newModule.save();

    // Update question banks with the new module ID
    const questionBankUpdateResult = await this.questionBankModel.updateMany(
      { module_id: id }, // Match the old module ID
      { $set: { module_id: savedModule._id } }, // Replace with the new module ID
    );
    console.log(
      `Updated ${questionBankUpdateResult.modifiedCount} question banks to new module ID.`,
    );

    // Update quizzes with the new module ID
    const quizzesUpdateResult = await this.quizModel.updateMany(
      { module_id: id }, // Match the old module ID
      { $set: { module_id: savedModule._id } }, // Replace with the new module ID
    );
    console.log(
      `Updated ${quizzesUpdateResult.modifiedCount} quizzes to new module ID.`,
    );

      // Step 7: Update the keywords array in the corresponding course
    try {
      const course = await this.courseModel.findById(existingModule.course_id).exec();
      if (!course) {
        throw new NotFoundException(`Course with ID ${existingModule.course_id} not found.`);
      }

      // Step 7.1: Modify the keywords array programmatically
      const updatedKeywords = course.keywords.filter(
        (keyword) => keyword !== existingModule.title,
      );
      updatedKeywords.push(savedModule.title);

      // Step 7.2: Save the updated keywords array
      course.keywords = Array.from(new Set(updatedKeywords)); // Ensure no duplicates
      await course.save();

      console.log(
        `Successfully updated keywords in the course with ID: ${existingModule.course_id}`,
      );
    } catch (error) {
      console.error(
        `Error updating keywords for course with ID: ${existingModule.course_id}. Error: ${error.message}`,
      );
      throw new BadRequestException('Failed to update keywords in the course.');
    }


    return savedModule;
  } catch (error) {
    console.error('Error:', error);
    throw new BadRequestException('Failed to update module with version control.');
  }
}



async getModuleById(id: string): Promise<ModuleDocument> {
  try {
      const module = await this.moduleModel.findById(id).exec();
      if (!module) {
          throw new NotFoundException(`Module with ID ${id} not found.`);
      }
      return module;
  } catch (error) {
      throw new BadRequestException(
          error.message || `Failed to retrieve module with ID ${id}.`
      );
  }
}

// Retrieve modules for a specific course, ordered by date (newest to oldest)
async getModulesByCourseOrderedByDate(courseId: string): Promise<ModuleDocument[]> {
  try {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }

    const modules = await this.moduleModel
      .find({ course_id: courseId })
      .sort({ created_at: -1 }) // Descending order (newest to oldest)
      .exec();

    if (!modules || modules.length === 0) {
      throw new NotFoundException(`No modules found for course ID ${courseId}.`);
    }

    return modules;
  } catch (error) {
    throw new BadRequestException(
      error.message || `Error retrieving modules for course ID ${courseId}.`
    );
  }
}

//   // Create a new module
//   async create(createModuleDto: CreateModuleDto): Promise<modules> {
//     try {
//       // Step 1: Find the highest module_order for the same course
//       const highestOrderModule = await this.moduleModel
//         .findOne({ course_id: createModuleDto.course_id })
//         .sort({ module_order: -1 }) // Sort in descending order by module_order
//         .exec();

//       const nextModuleOrder = highestOrderModule
//         ? highestOrderModule.module_order + 1
//         : 1; // Default to 1 if no modules exist

//       // Step 2: Set the module_order in the createModuleDto
//       createModuleDto.module_order = nextModuleOrder;

//       // Step 3: Create the new module
//       const newModule = new this.moduleModel(createModuleDto);
//       const savedModule = await newModule.save();

//       // Step 4: Increment the nom_of_modules in the corresponding course
//       const courseId = createModuleDto.course_id;
//       const updatedCourse = await this.courseModel.findByIdAndUpdate(
//         courseId,
//         { $inc: { nom_of_modules: 1 } }, // Increment nom_of_modules by 1
//         { new: true }, // Return the updated document
//       );

//       if (!updatedCourse) {
//         throw new NotFoundException('Course not found for the provided module');
//       }
//  // Step 3: Update the progress records
//  const progressRecords = await this.progressModel.find({ course_id: courseId });

//  if (progressRecords.length > 0) {
//    await Promise.all(
//      progressRecords.map(async (record) => {
//        // Extend the quiz_grades array to match the number of modules (quizzes)
//        const updatedQuizGrades = [...record.quiz_grades];
//        updatedQuizGrades.push(null); // Add a placeholder value (e.g., null for no grade yet)

//        // Update the progress record
//        await this.progressModel.findByIdAndUpdate(record._id, {
//          quiz_grades: updatedQuizGrades,
//        });
//      })
//    );
//  }
//       // Return the created module
//       return savedModule;
//     } catch (error) {
//       console.error('Error creating module:', error);
//       throw new BadRequestException('Failed to create module.');
//     }
//   }
// Create a new module
async create(createModuleDto: CreateModuleDto): Promise<modules> {
  try {
    // Step 1: Find the highest module_order for the same course
    const highestOrderModule = await this.moduleModel
      .findOne({ course_id: createModuleDto.course_id })
      .sort({ module_order: -1 }) // Sort in descending order by module_order
      .exec();

    const nextModuleOrder = highestOrderModule
      ? highestOrderModule.module_order + 1
      : 1; // Default to 1 if no modules exist

    // Step 2: Set the module_order in the createModuleDto
    createModuleDto.module_order = nextModuleOrder;

    // Step 3: Create the new module
    const newModule = new this.moduleModel(createModuleDto);
    const savedModule = await newModule.save();

    // Step 4: Increment the nom_of_modules in the corresponding course
    const courseId = createModuleDto.course_id;
    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      courseId,
      { 
        $inc: { nom_of_modules: 1 }, // Increment nom_of_modules by 1
      },
      { new: true } // Return the updated document
    );

    if (!updatedCourse) {
      throw new NotFoundException('Course not found for the provided module');
    }

    // Step 5: Add the module title to the keywords array in the course
    await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        $addToSet: { keywords: createModuleDto.title }, // Add module title to keywords array
      },
      { new: true } // Return the updated document
    );

    // Step 6: Update the progress records
    const progressRecords = await this.progressModel.find({ course_id: courseId });

    if (progressRecords.length > 0) {
      await Promise.all(
        progressRecords.map(async (record) => {
          // Extend the quiz_grades array to match the number of modules (quizzes)
          const updatedQuizGrades = [...record.quiz_grades];
          updatedQuizGrades.push(null); // Add a placeholder value (e.g., null for no grade yet)

          // Update the progress record
          await this.progressModel.findByIdAndUpdate(record._id, {
            quiz_grades: updatedQuizGrades,
          });
        })
      );
    }

    // Return the created module
    return savedModule;
  } catch (error) {
    console.error('Error creating module:', error);
    throw new BadRequestException('Failed to create module.');
  }
}

async findModulesForStudents(courseId: string): Promise<modules[]> {
  try {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }

    // Fetch all modules for the specific course where isModuleOutdated is false
    return await this.moduleModel
      .find(
        { course_id: courseId, isModuleOutdated: false }, // Filter by courseId and isModuleOutdated
        { modules_previousVersions: 0 } // Exclude the modules_previousVersions field
      )
      .exec();
  } catch (error) {
    throw new BadRequestException(
      error.message || 'Failed to retrieve modules for the specified course.'
    );
  }
}


}



