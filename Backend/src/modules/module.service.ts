import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { modules } from './module.schema';
import { CreateModuleDto } from './createmoduleDto';
import { UpdateModuleDto } from './updatemoduleDto';
import { RateModuleDto } from './ratemoduleDto';

@Injectable()
export class ModulesService {
  constructor(@InjectModel('modules') private moduleModel: Model<modules>) {}

  // Retrieve all modules
  async findAll(): Promise<modules[]> {
    return this.moduleModel.find().exec();
  }  //DONE

  // Retrieve a module by ID
  async findById(id: string): Promise<modules> {
    try {
      const module = await this.moduleModel.findById(id).exec();
      if (!module) {
        throw new NotFoundException(`Module with ID ${id} not found`);
      }
      return module;
    } catch (error) {
      throw new BadRequestException(`Invalid ID format or module not found: ${id}`);
    }
  }    //DONE

  // Create a new module
  async create(createModuleDto: CreateModuleDto): Promise<modules> {
    try {
      const newModule = new this.moduleModel(createModuleDto);
      return await newModule.save();
    } catch (error) {
      throw new BadRequestException('Invalid data provided for creating a module');
    }
  }  //DONE

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

  // Delete a module by ID
  async delete(id: string): Promise<void> {
    try {
      const result = await this.moduleModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Module with ID ${id} not found`);
      }
    } catch (error) {
      throw new BadRequestException(`Invalid ID format or delete failed for ID: ${id}`);
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
}   //DONE

