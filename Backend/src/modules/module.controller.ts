import {Controller,Get,Post,Patch,Delete,Param,Body,BadRequestException,NotFoundException} from '@nestjs/common';
import { ModulesService } from './module.service';
import { CreateModuleDto } from './createmoduleDto';
import { UpdateModuleDto } from './updatemoduleDto';
import { RateModuleDto } from './ratemoduleDto';
import { Types } from 'mongoose';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  async findAll() {
    try {
      return await this.modulesService.findAll();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve modules.');
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid module ID format.');
    }
    const module = await this.modulesService.findById(id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found.`);
    }
    return module;
  }

  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    try {
      return await this.modulesService.create(createModuleDto);
    } catch (error) {
      throw new BadRequestException('Failed to create module.');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid module ID format.');
    }
    try {
      return await this.modulesService.update(id, updateModuleDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update the module.');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid module ID format.');
    }
    try {
      return await this.modulesService.delete(id);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to delete the module.');
    }
  }

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
}