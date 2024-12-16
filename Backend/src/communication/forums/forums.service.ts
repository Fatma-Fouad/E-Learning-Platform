
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Forum,ForumDocument } from './fourms.schema';
import { NotificationGateway } from '../notifications/notificationGateway';
import { User, UserSchema } from '../../users/user.schema';


@Injectable()
export class ForumsService {
    constructor(
        @InjectModel(Forum.name) private readonly forumModel: Model<ForumDocument>,
        @InjectModel(User.name) private userModel: Model<User>, // Inject user model
        private readonly notificationGateway: NotificationGateway // Inject NotificationGateway
    ) { }


    //retrieving all forums in the database 
    async getAllForums(): Promise<Forum[]> {
        return this.forumModel.find().exec();
    }
   async getForumsByCourse(courseId: string): Promise<Forum[]> {
    return this.forumModel.find({ courseId }).exec();
  }
    //adding a new forum 
    async addForum(courseId: string, courseName: string, createdBy: string): Promise<any> {
        try {
            // Validate the `createdBy` field
            if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
                throw new Error('Invalid or missing createdBy field');
            }

            // Fetch user details to validate role (adjust based on your implementation)
            const user = await this.userModel.findById(createdBy).exec(); // Assuming `userModel` is available
            if (!user) {
                throw new Error('User not found');
            }

            if (user.role !== 'instructor') {
                throw new Error('Only instructors can create forums');
            }

            // Create the forum
            const forum = new this.forumModel({
                courseId: new mongoose.Types.ObjectId(courseId),
                courseName,
                createdBy: new mongoose.Types.ObjectId(createdBy),
                threads: [],
            });

            console.log('Creating forum:', forum);

            return await forum.save();
        } catch (error) {
            console.error('Error adding forum:', error.message);
            throw new Error('Unable to create forum');
        }
    }


    //add thread
    async addThread(courseId: string, thread: any): Promise<any> {
        try {
            const objectId = new mongoose.Types.ObjectId(courseId); // Ensure courseId is an ObjectId
            return await this.forumModel.findOneAndUpdate(
                { courseId: objectId },
                { $push: { threads: thread } },
                { new: true, useFindAndModify: false },
            ).exec();
        } catch (error) {
            console.error('Error adding thread:', error.message);
            throw new Error('Unable to add thread');
        }
    }

    //add reply
    async addReply(courseId: string, threadId: string, reply: any): Promise<any> {
        try {
            const courseObjectId = new mongoose.Types.ObjectId(courseId);
            const threadObjectId = new mongoose.Types.ObjectId(threadId);

            const newReply = {
                ...reply,
                replyId: new mongoose.Types.ObjectId(),
            };

            const updatedForum = await this.forumModel.findOneAndUpdate(
                {
                    courseId: courseObjectId,
                    "threads.threadId": threadObjectId,
                },
                {
                    $push: { "threads.$.replies": newReply },
                },
                { new: true, useFindAndModify: false }
            ).exec();

            const thread = updatedForum?.threads.find((t) =>
                t.threadId.toString() === threadObjectId.toString(),
            );

            if (!thread) {
                throw new NotFoundException(`Thread with ID ${threadId} not found`);
            }

            const threadCreatorId = thread.createdBy.toString();

            // Save notification to the database
            await this.notificationGateway.notificationService.createNotification(
                threadCreatorId,
                'reply',
                `New reply in your thread: ${thread.title}`,
                threadId // Optional: Add threadId for context
            );

            console.log(`Notification saved to database for thread creator: ${threadCreatorId}`);

            // Emit notification via WebSocket if the user is connected
            const roomName = `user:${threadCreatorId}`;
            const roomMembers = this.notificationGateway.server.sockets.adapter.rooms.get(roomName);

            if (roomMembers) {
                console.log(`Sending notification to room: ${roomName}`);
                this.notificationGateway.server.to(roomName).emit('newNotification', {
                    type: 'reply',
                    content: `New reply in your thread: ${thread.title}`,
                    threadId,
                    reply: newReply,
                });
            } else {
                console.log(`User ${threadCreatorId} has not joined room: ${roomName}`);
            }

            return updatedForum;
        } catch (error) {
            console.error('Error adding reply:', error.message);
            throw new Error('Unable to add reply.');
        }
    }

    //searching for the course first 
    async searchCourses(searchTerm: string): Promise<any> {
        try {
            const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
            console.log('Search Term Regex for Courses:', regex);

            // Query the database for matching courses
            const results = await this.forumModel.find({
                courseName: { $regex: searchTerm, $options: 'i' }, // Searching in course names
            }).exec();

            console.log('Course Search Results:', results);
            return results;
        } catch (error) {
            console.error('Error during course search:', error.message);
            throw new Error('Unable to perform course search.');
        }
    }


    // Search forums by thread title
    async searchForum(searchTerm: string): Promise<any> {
        try {
            const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
            console.log('Search Term Regex:', regex);

            // Query the database with $elemMatch to include only matching threads
            const results = await this.forumModel.find({
                'threads.title': { $regex: regex } // Match threads with title containing the search term
            }, {
                courseName: 1, // Include course name
                threads: { $elemMatch: { title: { $regex: regex } } } // Include only threads that match
            }).exec();

            console.log('Filtered Search Results:', results);
            return results;
        } catch (error) {
            console.error('Error during search:', error.message);
            throw new Error('Unable to perform search.');
        }
    }

    async searchThreadsInCourse(courseId: string, searchTerm: string): Promise<any> {
        try {
            const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex for matching
            console.log('Searching threads in courseId:', courseId, 'with searchTerm:', regex);

            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw new Error('Invalid courseId format');
            }

            // Query the database to find the specific course and filter threads
            const results = await this.forumModel.findOne(
                {
                    courseId: new mongoose.Types.ObjectId(courseId), // Ensure courseId is valid
                    'threads.title': { $regex: regex } // Match threads with title containing the searchTerm
                },
                {
                    courseName: 1, // Include courseName in the result
                    threads: { $elemMatch: { title: { $regex: regex } } } // Filter threads with $elemMatch
                }
            ).exec();

            if (!results) {
                throw new NotFoundException(`No threads found matching '${searchTerm}' in course '${courseId}'`);
            }

            console.log('Search Results:', results);
            return results;
        } catch (error) {
            console.error('Error during searchThreadsInCourse:', error.message);
            throw new Error('Unable to search threads in the specified course.');
        }
    }


    

    //delete a forum (has to be an insturctor )
    async deleteForum(courseId: string, userId: string): Promise<any> {
        try {
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw new Error(`Invalid courseId: ${courseId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error(`Invalid userId: ${userId}`);
            }

            const courseObjectId = new mongoose.Types.ObjectId(courseId);
            const userObjectId = new mongoose.Types.ObjectId(userId);

            console.log('Converted courseId to ObjectId:', courseObjectId);

            // Find the forum to validate the instructor
            const forum = await this.forumModel.findOne({ courseId: courseObjectId }).exec();

            if (!forum) {
                console.log(`Forum not found for courseId: ${courseId}`);
                throw new NotFoundException(`Forum with courseId ${courseId} not found`);
            }

            console.log('Forum found:', forum);

            // Check if the `createdBy` matches the provided userId
            if (forum.createdBy.toString() !== userObjectId.toString()) {
                throw new Error('Only the instructor who created the forum can delete it');
            }

            // Delete the forum
            const deletedForum = await this.forumModel.findOneAndDelete({ courseId: courseObjectId }).exec();

            console.log('Deleted Forum:', deletedForum);
            return { success: true, message: 'Forum deleted successfully.' };
        } catch (error) {
            console.error('Error deleting forum:', error.message);
            throw new Error('Unable to delete forum.');
        }



    }
    async editThread(courseId: string, threadId: string, userId: string, updateData: any): Promise<any> {
        try {
            // Validate ObjectId formats
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw new Error(`Invalid courseId: ${courseId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(threadId)) {
                throw new Error(`Invalid threadId: ${threadId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error(`Invalid userId: ${userId}`);
            }

            const courseObjectId = new mongoose.Types.ObjectId(courseId);
            const threadObjectId = new mongoose.Types.ObjectId(threadId);
            const userObjectId = new mongoose.Types.ObjectId(userId);

            // Find the forum by courseId
            const forum = await this.forumModel.findOne({ courseId: courseObjectId }).exec();
            if (!forum) {
                throw new NotFoundException(`Forum with courseId ${courseId} not found`);
            }

            // Find the thread to be edited
            const thread = forum.threads.find((t) => t.threadId.toString() === threadObjectId.toString());
            if (!thread) {
                throw new NotFoundException(`Thread with threadId ${threadId} not found`);
            }

            // Find the user who is trying to edit the thread
            const user = await this.userModel.findById(userId).exec();
            if (!user) {
                throw new NotFoundException(`User with userId ${userId} not found`);
            }

            // Check permissions
            if (user.role === 'student') {
                // Students can only edit threads they created
                if (thread.createdBy.toString() !== userObjectId.toString()) {
                    throw new ForbiddenException('You do not have permission to edit this thread');
                }
            } else if (user.role === 'instructor') {
                // Instructors can edit threads they created or threads created by students
                const threadCreator = await this.userModel.findById(thread.createdBy).exec();
                if (!threadCreator) {
                    throw new NotFoundException(`Thread creator with userId ${thread.createdBy} not found`);
                }

                if (threadCreator.role === 'instructor' && thread.createdBy.toString() !== userObjectId.toString()) {
                    throw new ForbiddenException(
                        'Instructors can only edit threads they created or threads created by students'
                    );
                }
            } else {
                // Other roles (e.g., admin) may not have edit permissions
                throw new ForbiddenException('You do not have permission to edit this thread');
            }

            // Update the thread
            Object.assign(thread, updateData);

            // Save the updated forum document
            const updatedForum = await forum.save();

            console.log('Updated Forum:', updatedForum);
            return { success: true, message: 'Thread updated successfully.', updatedForum };
        } catch (error) {
            console.error('Error editing thread:', error.message);
            throw new Error('Unable to edit thread.');
        }
    }



    // Delete a thread
    async deleteThread(courseId: string, threadId: string, userId: string): Promise<any> {
        try {
            // Validate ObjectId formats
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw new Error(`Invalid courseId: ${courseId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(threadId)) {
                throw new Error(`Invalid threadId: ${threadId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error(`Invalid userId: ${userId}`);
            }

            const courseObjectId = new mongoose.Types.ObjectId(courseId);
            const threadObjectId = new mongoose.Types.ObjectId(threadId);
            const userObjectId = new mongoose.Types.ObjectId(userId);

            // Find the forum by courseId
            const forum = await this.forumModel.findOne({ courseId: courseObjectId }).exec();
            if (!forum) {
                throw new NotFoundException(`Forum with courseId ${courseId} not found`);
            }

            // Find the thread to be deleted
            const thread = forum.threads.find((t) => t.threadId.toString() === threadObjectId.toString());
            if (!thread) {
                throw new NotFoundException(`Thread with threadId ${threadId} not found`);
            }

            // Find the user who is trying to delete the thread
            const user = await this.userModel.findById(userId).exec();
            if (!user) {
                throw new NotFoundException(`User with userId ${userId} not found`);
            }

            // Check permissions
            if (user.role === 'student') {
                // Students can only delete threads they created
                if (thread.createdBy.toString() !== userObjectId.toString()) {
                    throw new ForbiddenException('You do not have permission to delete this thread');
                }
            } else if (user.role === 'instructor') {
                // Instructors can delete threads they created or threads created by students
                const threadCreator = await this.userModel.findById(thread.createdBy).exec();
                if (!threadCreator) {
                    throw new NotFoundException(`Thread creator with userId ${thread.createdBy} not found`);
                }

                if (threadCreator.role === 'instructor' && thread.createdBy.toString() !== userObjectId.toString()) {
                    throw new ForbiddenException(
                        'Instructors can only delete threads they created or threads created by students'
                    );
                }
            } else {
                // Other roles (e.g., admin) may not have delete permissions
                throw new ForbiddenException('You do not have permission to delete this thread');
            }

            // Remove the thread
            forum.threads = forum.threads.filter((t) => t.threadId.toString() !== threadObjectId.toString());

            // Save the updated forum document
            const updatedForum = await forum.save();

            console.log('Updated Forum:', updatedForum);
            return { success: true, message: 'Thread deleted successfully.', updatedForum };
        } catch (error) {
            console.error('Error deleting thread:', error.message);
            throw new Error('Unable to delete thread.');
        }
    }

    // Delete a reply
    async deleteReply(courseId: string, threadId: string, replyId: string, userId: string): Promise<any> {
        try {
            console.log('Deleting reply:', { courseId, threadId, replyId, userId });

            const courseObjectId = new mongoose.Types.ObjectId(courseId);
            const threadObjectId = new mongoose.Types.ObjectId(threadId);
            const replyObjectId = new mongoose.Types.ObjectId(replyId);

            // Find the forum by courseId
            const forum = await this.forumModel.findOne({ courseId: courseObjectId }).exec();

            if (!forum) {
                throw new NotFoundException(`Forum with courseId ${courseId} not found`);
            }

            // Find the thread in the forum
            const thread = forum.threads.find((t) => t.threadId.toString() === threadObjectId.toString());

            if (!thread) {
                throw new NotFoundException(`Thread with threadId ${threadId} not found`);
            }

            // Find the reply in the thread
            const reply = thread.replies.find((r) => r.replyId.toString() === replyObjectId.toString());

            if (!reply) {
                throw new NotFoundException(`Reply with replyId ${replyId} not found`);
            }

            // Check if the user trying to delete the reply is the creator of the reply
            if (reply.userId.toString() !== userId) {
                throw new Error('Only the creator of the reply can delete it');
            }

            // Remove the reply from the replies array
            thread.replies = thread.replies.filter((r) => r.replyId.toString() !== replyObjectId.toString());
            console.log('Replies after deletion:', thread.replies);

            // Save the forum document after deletion
            return forum.save();
        } catch (error) {
            console.error('Error deleting reply:', error.message);
            throw new Error('Unable to delete reply.');
        }
    }


}





//getforumsByCourseId
/* async getForumByCourseId(courseId: string): Promise<Forum | null> {
     console.log('Received courseId in service:', courseId); // Log the raw courseId before processing
 
     try {
         if (!mongoose.Types.ObjectId.isValid(courseId)) {
             console.error('Invalid ObjectId format:', courseId); // Log invalid format
             throw new Error('Invalid ObjectId format');
         }
 
         const objectId = new mongoose.Types.ObjectId(courseId);
         console.log('Searching for forum with ObjectId:', objectId); // Log the converted ObjectId
 
         return await this.forumModel.findOne({ courseId: objectId }).exec();
     } catch (error) {
         console.error('Error in getForumByCourseId:', error.message);
         throw error;
     }
 }*/
// now student can search for a specific course then he will get all threads in that course 
// student can search for a specific thread then he will get the thread details(only the one he searched for)



export default ForumsService;