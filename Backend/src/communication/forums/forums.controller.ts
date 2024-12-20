import { Controller, Get, Post, Param, Body, Query, NotFoundException, BadRequestException, Delete, Put, UseGuards } from '@nestjs/common';
import { ForumsService } from './forums.service';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';


@Controller('forums') // Maps to `/forums`
export class ForumsController {
    constructor(private readonly forumsService: ForumsService) { }

    @Get() // Maps to GET /forums
    // Get all forums (Access: Admin)
    @Get()

    getAllForums() {
        console.log('GET /forums called');
        return this.forumsService.getAllForums();
    }
    // Get forums by courseId
    @Get('course/:courseId') // Route: /forums/course/:courseId
    getForumsByCourse(@Param('courseId') courseId: string) {
        return this.forumsService.getForumsByCourse(courseId);
    }


    // Create a new forum
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
            createdBy: new mongoose.Types.ObjectId(body.createdBy),
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
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new BadRequestException('Invalid courseId format.');
        }

        if (!mongoose.Types.ObjectId.isValid(threadId)) {
            throw new BadRequestException('Invalid threadId format.');
        }

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

    // Edit a thread
    @Put(':courseId/threads/:threadId')
    async editThread(
        @Param('courseId') courseId: string,
        @Param('threadId') threadId: string,
        @Query('userId') userId: string,
        @Body() updateData: { title?: string; description?: string },
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is required to edit a thread.');
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            throw new BadRequestException('Update data cannot be empty.');
        }

        console.log(`Editing thread ${threadId} in course ${courseId} by user ${userId}`);
        return this.forumsService.editThread(courseId, threadId, userId, updateData);
    }

    // Delete a forum
    @Delete(':forumId') // Maps to DELETE /forums/:forumId
    async deleteForum(
        @Param('forumId') forumId: string, // Extracts forumId from the route
        @Query('userId') userId: string    // Extracts userId from the query
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is required to delete a forum.');
        }

        console.log(`Deleting forum with forumId: ${forumId} by user ${userId}`);
        return this.forumsService.deleteForumById(forumId, userId);
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
