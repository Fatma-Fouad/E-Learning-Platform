
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Forum,ForumDocument } from './fourms.schema';
import { NotificationGateway } from '../notifications/notificationGateway';
import { User, UserSchema } from '../../users/user.schema';
import { courses, CourseDocument } from '../../courses/course.schema'; // Adjust the path if needed


@Injectable()
export class ForumsService {
    constructor(
        @InjectModel(Forum.name) private readonly forumModel: Model<ForumDocument>,
        @InjectModel(User.name) private userModel: Model<User>, // Inject user model
        private readonly notificationGateway: NotificationGateway, // Inject NotificationGateway
         @InjectModel(courses.name) private readonly courseModel: Model<CourseDocument>, // Inject courseModel
    ) { }


    //retrieving all forums in the database 
    async getAllForums(): Promise<Forum[]> {
        return this.forumModel.find().exec();
    }
    async getForumsByCourse(courseId: string, userId: string): Promise<any> {
        try {
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw new BadRequestException(`Invalid courseId: ${courseId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new BadRequestException(`Invalid userId: ${userId}`);
            }

            const objectId = new mongoose.Types.ObjectId(courseId);
            const userObjectId = new mongoose.Types.ObjectId(userId);

            // ✅ Add the user to participants if not already included
            const updatedForum = await this.forumModel.findOneAndUpdate(
                { courseId: objectId },
                { $addToSet: { participants: userObjectId } },
                { new: true, useFindAndModify: false }
            ).exec();

            if (!updatedForum) {
                throw new NotFoundException(`Course with ID ${courseId} not found.`);
            }

            console.log('✅ User added to participants:', userId);

            // ✅ Populate course and user data
            return await this.forumModel
                .find({ courseId: objectId })
                .populate('courseId', 'courseName')
                .populate({
                    path: 'threads.createdBy',
                    select: 'name',
                })
                .populate({
                    path: 'threads.replies.userId',
                    select: 'name',
                })
                .exec();
        } catch (error) {
            console.error('❌ Error in getForumsByCourse:', error.message);
            throw new InternalServerErrorException(`Unable to fetch forums: ${error.message}`);
        }
    }


    async addForum(courseId: string, courseName: string, createdBy: string): Promise<any> {
        try {
            // ✅ Validate the `createdBy` field
            if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
                throw new BadRequestException('Invalid or missing createdBy field');
            }

            // ✅ Fetch user details to validate role
            const user = await this.userModel.findById(createdBy).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }

            if (user.role !== 'instructor') {
                throw new ForbiddenException('Only instructors can create forums');
            }

            // ✅ Fetch course details to get enrolled students
            const course = await this.courseModel.findById(courseId).exec();
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            // Collect all participants (Instructor + Enrolled Students)
            const participants = [
                createdBy,
                ...course.enrolled_student_ids.map((studentId) => studentId.toString()) // Ensure proper string conversion
            ];

            // Remove duplicates in participants
            const uniqueParticipants = Array.from(new Set(participants));

            // ✅ Create the forum
            const forum = new this.forumModel({
                courseId: new mongoose.Types.ObjectId(courseId),
                courseName,
                createdBy: new mongoose.Types.ObjectId(createdBy),
                threads: [],
                participants: uniqueParticipants,
            });

            console.log('✅ Creating forum with participants:', uniqueParticipants);

            const savedForum = await forum.save();

            console.log('✅ Forum created successfully:', savedForum);

            return savedForum;
        } catch (error) {
            console.error('❌ Error adding forum:', error.message);
            throw new InternalServerErrorException('Unable to create forum');
        }
    }

    //add thread
    async addThread(courseId: string, thread: any): Promise<any> {
        try {
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw new BadRequestException(`Invalid courseId: ${courseId}`);
            }

            const objectId = new mongoose.Types.ObjectId(courseId);

            if (!thread.title || !thread.createdBy) {
                throw new BadRequestException('Thread title and createdBy are required.');
            }

            const threadData: any = {
                title: thread.title,
                createdBy: thread.createdBy,
            };

            if (thread.description) {
                threadData.description = thread.description;
            }

            const updatedForum = await this.forumModel.findOneAndUpdate(
                { courseId: objectId },
                { $push: { threads: threadData } },
                { new: true, useFindAndModify: false },
            ).exec();

            if (!updatedForum) {
                throw new NotFoundException(`Course with ID ${courseId} not found.`);
            }

            console.log('✅ Thread added successfully:', threadData);

            // Fetch creator details
            const creator = await this.userModel.findById(thread.createdBy).select('name').exec();
            const senderName = creator?.name || 'Unknown User';

            // Ensure participants are strings and filter out the sender
            const participantIds: string[] = (updatedForum.participants || [])
                .map((participantId) => participantId.toString())
                .filter((participantId) => participantId !== thread.createdBy.toString());

            console.log('✅ Participants to Notify:', participantIds);

            // Trigger Notification
            await this.notificationGateway.sendThreadNotification(
                participantIds,
                thread.title,
                senderName,
                thread.createdBy
            );

            console.log('✅ Notification triggered successfully.');
            return updatedForum;
        } catch (error) {
            console.error('❌ Error adding thread:', error.message);
            throw new InternalServerErrorException('Unable to add thread.');
        }
    }


    async addReply(courseId: string, threadId: string, reply: any): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(threadId)) {
            throw new BadRequestException('Invalid courseId or threadId.');
        }

        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        const threadObjectId = new mongoose.Types.ObjectId(threadId);

        const newReply = {
            ...reply,
            replyId: new mongoose.Types.ObjectId(),
            timestamp: new Date(),
        };

        try {
            // ✅ Add the Reply to the Thread
            const updatedForum = await this.forumModel.findOneAndUpdate(
                {
                    courseId: courseObjectId,
                    "threads.threadId": threadObjectId,
                },
                {
                    $push: { "threads.$.replies": newReply },
                },
                { new: true, useFindAndModify: false },
            ).exec();

            if (!updatedForum) {
                throw new NotFoundException(`Thread with ID ${threadId} not found in course ${courseId}`);
            }

            console.log('✅ Reply added successfully:', newReply);

            // ✅ Fetch Replier's Name
            const replier = await this.userModel.findById(reply.userId).select('name').exec();
            const senderName = replier?.name || 'Unknown User';

            // ✅ Ensure Participants are Strings & Exclude the Sender
            const participantIds: string[] = (updatedForum.participants || [])
                .map((participantId) => participantId.toString())
                .filter((participantId) => participantId !== reply.userId.toString());

            console.log('✅ Participants to Notify (excluding sender):', participantIds);

            // ✅ Trigger Notification
            await this.notificationGateway.sendReplyNotification(
                participantIds,
                reply.message,
                senderName,
                reply.userId
            );

            return updatedForum;
        } catch (error) {
            console.error('❌ Error adding reply:', error.message);
            throw new InternalServerErrorException('Unable to add reply.');
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

    

    async searchThreadsInCourse(courseId: string, searchTerm: string): Promise<any[]> {
        try {
            const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
            console.log('🔍 Searching threads in courseId:', courseId, 'with searchTerm:', regex);

            // Query forums by courseId and filter threads with a regex match on the title
            const result = await this.forumModel.find(
                {
                    courseId: courseId,
                    'threads.title': { $regex: regex }
                },
                {
                    courseName: 1,
                    threads: { $elemMatch: { title: { $regex: regex } } }
                }
            ).exec();

            console.log('🔄 Raw Search Results:', result);

            // Flatten the threads from all matching forums
            const filteredThreads = result.flatMap(forum => forum.threads || []);

            console.log('🧵 Filtered Threads:', filteredThreads);
            return filteredThreads;
        } catch (error) {
            console.error('❌ Backend Error during search:', error.message);
            throw new Error('Unable to perform search.');
        }
    }


    

    //delete a forum (has to be an insturctor )
    async deleteForumById(forumId: string, userId: string): Promise<any> {
        try {
            if (!mongoose.Types.ObjectId.isValid(forumId)) {
                throw new Error(`Invalid forumId: ${forumId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error(`Invalid userId: ${userId}`);
            }

            const forum = await this.forumModel.findById(forumId).exec();

            if (!forum) {
                throw new NotFoundException(`Forum with ID ${forumId} not found.`);
            }

            // Check if the forum was created by the same user
            if (forum.createdBy.toString() !== userId) {
                throw new Error('Only the instructor who created the forum can delete it.');
            }

            await this.forumModel.findByIdAndDelete(forumId).exec();
            return { success: true, message: 'Forum deleted successfully.' };
        } catch (error) {
            console.error('Error deleting forum:', error.message);
            throw new Error('Unable to delete forum.');
        }
    


    }
    async editThread(
        courseId: string,
        threadId: string,
        userId: string,
        updateData: any
    ): Promise<any> {
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

            // Validate user permissions
            const user = await this.userModel.findById(userId).exec();
            if (!user) {
                throw new NotFoundException(`User with userId ${userId} not found`);
            }

            if (user.role === 'student' && thread.createdBy.toString() !== userObjectId.toString()) {
                throw new ForbiddenException('Students can only edit their own threads.');
            }

            if (user.role === 'instructor') {
                const threadCreator = await this.userModel.findById(thread.createdBy).exec();
                if (!threadCreator) {
                    throw new NotFoundException(`Thread creator with userId ${thread.createdBy} not found`);
                }

                if (threadCreator.role === 'instructor' && thread.createdBy.toString() !== userObjectId.toString()) {
                    throw new ForbiddenException(
                        'Instructors can only edit their own threads or threads created by students.'
                    );
                }
            }

            // Update the thread with only provided fields
            if (updateData.title) thread.title = updateData.title;
            if (updateData.description) thread.description = updateData.description;

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
    async deleteReply(
        courseId: string,
        threadId: string,
        replyId: string,
        userId: string
    ): Promise<any> {
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

            // Fetch the roles of the reply creator and the user trying to delete the reply
            const replyCreator = await this.userModel.findById(reply.userId).exec();
            const deletingUser = await this.userModel.findById(userId).exec();

            if (!replyCreator || !deletingUser) {
                throw new NotFoundException('User not found.');
            }

            // Check deletion permissions
            if (
                reply.userId.toString() === userId || // The creator of the reply can delete it
                (deletingUser.role === 'instructor' && replyCreator.role === 'student') // Instructors can delete student replies
            ) {
                // Remove the reply from the replies array
                thread.replies = thread.replies.filter((r) => r.replyId.toString() !== replyObjectId.toString());
                console.log('Replies after deletion:', thread.replies);

                // Save the forum document after deletion
                return forum.save();
            } else {
                throw new ForbiddenException('You do not have permission to delete this reply.');
            }
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