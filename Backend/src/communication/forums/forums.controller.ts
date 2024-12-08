import { Controller, Get, Post, Param, Body, Query, NotFoundException, BadRequestException, Delete, UseGuards } from '@nestjs/common';
import { ForumsService } from './forums.service';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';

@Controller('forums')
export class ForumsController {
    constructor(private readonly forumsService: ForumsService) { }

    // Get all forums (Access: Admin)
    @Get()
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role)
    getAllForums() {
        return this.forumsService.getAllForums();
    }

    // Create a new forum (Access: Instructor, Admin)
    @Post('create')
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role, 'instructor' as Role)
    async addForum(
        @Body() body: { courseId: string; courseName: string; createdBy: string }
    ) {
        const { courseId, courseName, createdBy } = body;

        if (!courseId || !courseName || !createdBy) {
            throw new BadRequestException('All fields (courseId, courseName, createdBy) are required');
        }

        console.log('Creating forum with:', body);

        return this.forumsService.addForum(courseId, courseName, createdBy);
    }

    // Search for a specific course (Access: Student, Instructor, Admin)
    @Get('search-courses')
    @UseGuards(AuthGuard) 
    async searchCourses(@Query('q') searchTerm: string) {
        console.log('Search term received for courses:', searchTerm);
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.forumsService.searchCourses(searchTerm);
    }

    // Search forums by thread title in all courses (Access: Student, Instructor, Admin)
    @Get('search')
    @UseGuards(AuthGuard) 
    async searchForum(@Query('q') searchTerm: string) {
        console.log('Search term received:', searchTerm);
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.forumsService.searchForum(searchTerm);
    }

    // Search for threads within a specific course (Access: Student, Instructor, Admin)
    @Get(':courseId/search-threads')
    @UseGuards(AuthGuard) 
    async searchThreadsInCourse(
        @Param('courseId') courseId: string,
        @Query('q') searchTerm: string,
    ) {
        console.log('Search threads in course:', courseId, 'Search Term:', searchTerm);
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.forumsService.searchThreadsInCourse(courseId, searchTerm);
    }

    // Post a new thread (Access: Student, Instructor, Admin)
    @Post(':courseId/threads')
    @UseGuards(AuthGuard) 
    addThread(
        @Param('courseId') courseId: string,
        @Body() body: { title: string; description: string; createdBy: string },
    ) {
        if (!body.createdBy) {
            throw new BadRequestException('The createdBy field is required.');
        }

        const thread = {
            threadId: new mongoose.Types.ObjectId(),
            title: body.title,
            description: body.description,
            createdBy: new mongoose.Types.ObjectId(body.createdBy), // Convert to ObjectId
            createdAt: new Date(),
            replies: [],
        };

        console.log('Received thread:', thread, 'for courseId:', courseId);

        return this.forumsService.addThread(courseId, thread);
    }

    // Add a reply to a thread (Access: Student, Instructor, Admin)
    @Post(':courseId/threads/:threadId/replies')
    @UseGuards(AuthGuard) 
    async addReply(
        @Param('courseId') courseId: string,
        @Param('threadId') threadId: string,
        @Body() body: { userId: string; message: string },
    ) {
        if (!body.userId || !body.message) {
            throw new BadRequestException('userId and message are required.');
        }

        const reply = {
            userId: new mongoose.Types.ObjectId(body.userId),
            message: body.message,
            timestamp: new Date(),
        };

        console.log('Reply to be added:', reply);
        return this.forumsService.addReply(courseId, threadId, reply);
    }

    // Delete a forum (Access: Admin, Instructor)
    @Delete(':courseId')
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role, 'instructor' as Role)
    async deleteForum(
        @Param('courseId') courseId: string,
        @Query('userId') userId: string // Pass userId as a query parameter
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is required to delete a forum.');
        }

        console.log(`Deleting forum for courseId: ${courseId} by user ${userId}`);
        return this.forumsService.deleteForum(courseId, userId);
    }

    // Delete a thread in a course (Access: Admin,User who posted the thread)
    @Delete(':courseId/threads/:threadId')
    @UseGuards(AuthGuard) 
    async deleteThread(
        @Param('courseId') courseId: string,
        @Param('threadId') threadId: string,
        @Query('userId') userId: string,
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is required to delete a thread.');
        }

        console.log(`Deleting thread ${threadId} in course ${courseId} by user ${userId}`);
        return this.forumsService.deleteThread(courseId, threadId, userId);
    }

    // Delete a reply in a thread (Access: Admin,User who posted the reply)
    @Delete(':courseId/threads/:threadId/replies/:replyId')
    @UseGuards(AuthGuard) 
    async deleteReply(
        @Param('courseId') courseId: string,
        @Param('threadId') threadId: string,
        @Param('replyId') replyId: string,
        @Query('userId') userId: string,
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is required to delete a reply.');
        }

        console.log(`Deleting reply ${replyId} in thread ${threadId} in course ${courseId} by user ${userId}`);
        return this.forumsService.deleteReply(courseId, threadId, replyId, userId);
    }
}
