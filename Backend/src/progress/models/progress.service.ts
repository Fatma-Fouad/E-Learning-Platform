import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { progress, ProgressDocument } from './progress.schema';
import { CourseDocument } from '../../courses/course.schema';
import { ModuleDocument } from '../../modules/module.schema';
import { UserDocument } from '../../users/user.schema';

@Injectable()
export class ProgressService {
  constructor(@InjectModel('progress') private readonly progressModel: Model<ProgressDocument>,
  @InjectModel('course') private readonly courseModel: Model<CourseDocument>,
  @InjectModel('module') private readonly moduleModel: Model<ModuleDocument>,
  @InjectModel('user') private readonly userModel: Model<UserDocument>
) {}

// Reports on student engagement:
async getStudentsEngagementReport(courseId: string) {
  const progressRecords = await this.progressModel.find().exec();
  
  if (!progressRecords || progressRecords.length === 0) {
    return { message: 'No students are enrolled in any courses.' };
  }

  // Filter progress records for the specific course
  const courseProgressRecords = progressRecords.filter(
    (record) => record.course_id.toString() === courseId
  );

  if (!courseProgressRecords.length) {
    return { message: 'No students are enrolled in this course.' };
  }

  const totalStudents = courseProgressRecords.length;
  const completedStudents = courseProgressRecords.filter(
    (record) => record.completion_percentage === 100
  ).length;

  const validScores = courseProgressRecords
    .map((record) => record.avg_score)
    .filter((score) => score !== null);
  const totalAvgScore = validScores.reduce((sum, score) => sum + score, 0);
  const averageCourseScore = validScores.length > 0 ? totalAvgScore / validScores.length : 0;

  const performanceCounts = {
    below_average: courseProgressRecords.filter(
      (record) => record.avg_score !== null && record.avg_score < 40
    ).length,
    average: courseProgressRecords.filter(
      (record) => record.avg_score !== null && record.avg_score >= 40 && record.avg_score < 60
    ).length,
    above_average: courseProgressRecords.filter(
      (record) => record.avg_score !== null && record.avg_score >= 60 && record.avg_score < 80
    ).length,
    excellent: courseProgressRecords.filter(
      (record) => record.avg_score !== null && record.avg_score >= 80
    ).length,
  };

  const validCompletion = courseProgressRecords
    .map((record) => record.completion_percentage)
    .filter((percentage) => percentage !== null);
  const totalCompletion = validCompletion.reduce((sum, percentage) => sum + percentage, 0);
  const averageCompletionPercentage =
    validCompletion.length > 0 ? totalCompletion / validCompletion.length : 0;

  return {
    totalEnrolledStudents: totalStudents,
    completedStudents,
    performanceMetrics: performanceCounts,
    averageCompletionPercentage: parseFloat(averageCompletionPercentage.toFixed(2)),
    averageCourseScore: parseFloat(averageCourseScore.toFixed(2)),
  };
}

// Reports on content effectiveness:
async getContentEffectivenessReport(courseId: string) {
  const course = await this.courseModel.findById(courseId).exec();
  if (!course) return { message: 'Course not found.' };

  const modules = await this.moduleModel.find({ course_id: courseId }).sort({ module_order: 1 }).exec();

  if (!modules.length) {
    return { message: 'No modules available for this course.' };
  }

  const validModuleRatings = modules
    .map((module) => module.module_rating)
    .filter((rating) => typeof rating === 'number' && !isNaN(rating));

  const validRatingCount = validModuleRatings.length;
  const averageCourseRating =
    validRatingCount > 0
      ? parseFloat((validModuleRatings.reduce((sum, rating) => sum + rating, 0) / validRatingCount).toFixed(2))
      : 'No rating yet';

  const moduleDetails = modules.map((module) => ({
    title: `Module ${module.module_order}`,
    details: {
      moduleName: module.title,
      moduleOrder: module.module_order,
      moduleVersion: module.module_version,
      moduleRating: module.module_rating ?? 'No rating yet',
    },
  }));

  const comments = course.comments && course.comments.length > 0 ? course.comments : ['No comments on the course!'];

  return {
    courseRating: averageCourseRating,
    instructorRating: course.instructor_rating || 'No rating yet',
    comments,
    modules: moduleDetails,
    validModuleCount: validRatingCount,
  };
}

// Reports on Assessment Results:
async getQuizResultsReport(courseId: string) {
  const progress = await this.progressModel.find({ course_id: courseId }).exec();

  if (!progress || progress.length === 0) {
    return { message: 'No quiz results found for this course.' };
  }

  const quizResults = progress.map((p) => ({
    userId: p.user_id,
    userName: p.user_name,
    quizzesTaken: p.quizzes_taken || 0,
    lastQuizScore: p.last_quiz_score || 0,
    avgScore: p.avg_score || 0,
    quizGrades: p.quiz_grades || [],
  }));

  const maxQuizzes = Math.max(...quizResults.map((record) => record.quizGrades.length));
  const quizzesDetails = [];

  for (let i = 0; i < maxQuizzes; i++) {
    const quizDetails = quizResults
      .filter((record) => record.quizGrades[i] !== undefined)
      .map((record) => ({
        userId: record.userId,
        userName: record.userName,
        grade: record.quizGrades[i],
      }));

    quizzesDetails.push({
      quizNumber: i + 1,
      participants: quizDetails.length,
      details: quizDetails,
    });
  }

  return {
    quizzesDetails,
  };
}

  
// Reports on Individual Students by userId and courseId
async getStudentReport(userId: string, courseId: string) {
  // Fetch the user details
  const user = await this.userModel.findById(userId).exec();
  if (!user) {
    throw new NotFoundException(`User with ID: ${userId} not found.`);
  }

  // Fetch the progress record for the specific course
  const studentProgress = await this.progressModel.findOne({ user_id: userId, course_id: courseId }).exec();
  if (!studentProgress) {
    throw new NotFoundException(`No progress data found for student with ID: ${userId} in course ID: ${courseId}.`);
  }

  // Extract the student's name and GPA from the user record
  const studentName = user.name;
  const studentGpa = user.gpa || 'Not Available';

  // Fetch the course associated with the progress
  const course = await this.courseModel.findById(courseId).exec();
  if (!course) {
    throw new NotFoundException(`Course with ID: ${courseId} not found.`);
  }

  // Fetch all progress records for this course to calculate the course-wide average
  const courseProgress = await this.progressModel.find({ course_id: courseId }).exec();

  // Calculate the average quiz score for the course
  const validScores = courseProgress
    .map((record) => record.avg_score)
    .filter((score) => score !== null); // Exclude null scores

  const totalAvgScore = validScores.reduce((sum, score) => sum + score, 0);
  const averageCourseScore = validScores.length > 0 ? totalAvgScore / validScores.length : 0;

 // Determine the student's performance metric
const avgScore = studentProgress.avg_score || 0;
let performanceMetric: string;

// Define static boundaries for performance metrics
const maxScore = 100;
const belowAverageThreshold = 40; // Below Average threshold
const averageThreshold = 60; // Average threshold
const aboveAverageThreshold = 80; // Above Average threshold

if (avgScore < belowAverageThreshold) {
  performanceMetric = 'Below Average';
} else if (avgScore >= belowAverageThreshold && avgScore < averageThreshold) {
  performanceMetric = 'Average';
} else if (avgScore >= averageThreshold && avgScore < aboveAverageThreshold) {
  performanceMetric = 'Above Average';
} else {
  performanceMetric = 'Excellent';
}


  // Quiz details from progress
  const quizzesTaken = studentProgress.quizzes_taken || 0;
  const lastQuizScore = studentProgress.last_quiz_score || 0;

  const quizGradesDetails = (studentProgress.quiz_grades || []).map((grade, index) => ({
    quizNumber: index + 1, // Quiz number (1-based)
    grade: grade !== null ? grade : 'Not Attempted', // Show "Not Attempted" if null
  }));

  // Prepare course-specific report
  const courseReport = {
    courseName: course.title,
    progress: {
      completionPercentage: studentProgress.completion_percentage,
      quizzesTaken,
      lastQuizScore,
      avgScore,
    },
    quizGrades: quizGradesDetails, // Include detailed quiz grades
    performanceMetric, // Student's performance relative to the course
  };

  // Compile the tailored student report
  return {
    studentName,
    gpa: studentGpa,
    course: courseReport,
  };
}





}
