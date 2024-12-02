import { Controller, Get, Post, Param, Body, Query, NotFoundException, BadRequestException, Delete, } from '@nestjs/common';
import { ForumsService } from './forums.service';
import mongoose from 'mongoose';

@Controller('forums')
export class ForumsController {
    constructor(private readonly forumsService: ForumsService) { }

    // Get all forums
    @Get()
    getAllForums() {
        return this.forumsService.getAllForums();
    }

    @Post('create')
    @Post('create')
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



    // Search for a specific course
    @Get('search-courses')
    async searchCourses(@Query('q') searchTerm: string) {
        console.log('Search term received for courses:', searchTerm);
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.forumsService.searchCourses(searchTerm);
    }

    // Search forums by thread title in all courses
    @Get('search')
    async searchForum(@Query('q') searchTerm: string) {
        console.log('Search term received:', searchTerm);
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.forumsService.searchForum(searchTerm);
    }

    // Search for threads within a specific course
    @Get(':courseId/search-threads')
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

    // Post a new thread
    @Post(':courseId/threads')
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


    // Add a reply to a thread
    @Post(':courseId/threads/:threadId/replies')
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

    // Delete a forum
    @Delete(':courseId')
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


    // Delete a thread in a course
    @Delete(':courseId/threads/:threadId')
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

    // Delete a reply in a thread
    @Delete(':courseId/threads/:threadId/replies/:replyId')
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
