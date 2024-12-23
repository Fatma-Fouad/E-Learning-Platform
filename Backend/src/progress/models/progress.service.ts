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
      throw new NotFoundException('No student progress data found.');
    }
  
    // Filter progress records for the specific course
    const courseProgressRecords = progressRecords.filter(
      (record) => record.course_id.toString() === courseId
    );
  
    if (!courseProgressRecords.length) {
      throw new NotFoundException('No engagement data found for this course.');
    }
  
    const totalStudents = courseProgressRecords.length;
    const completedStudents = courseProgressRecords.filter(
      (record) => record.completion_percentage === 100
    ).length;
  
    // Calculate average course score, skipping null avg_score values
    const validScores = courseProgressRecords
    .map((record) => record.avg_score)
    .filter((score) => score !== null);
    const totalAvgScore = validScores.reduce((sum, score) => sum + score, 0);
    const averageCourseScore = validScores.length > 0 ? totalAvgScore / validScores.length : 0;

    // Define static boundaries for performance metrics
    const belowAverageThreshold = 40; // Below Average threshold
    const averageThreshold = 60; // Average threshold
    const aboveAverageThreshold = 80; // Above Average threshold

    // Count performance tiers based on the new thresholds
    const performanceCounts = {
    below_average: courseProgressRecords.filter(
      (record) => record.avg_score !== null && record.avg_score < belowAverageThreshold
    ).length,
    average: courseProgressRecords.filter(
      (record) =>
        record.avg_score !== null &&
        record.avg_score >= belowAverageThreshold &&
        record.avg_score < averageThreshold
    ).length,
    above_average: courseProgressRecords.filter(
      (record) =>
        record.avg_score !== null &&
        record.avg_score >= averageThreshold &&
        record.avg_score < aboveAverageThreshold
    ).length,
    excellent: courseProgressRecords.filter(
      (record) => record.avg_score !== null && record.avg_score >= aboveAverageThreshold
    ).length,
    };

  
    // Calculate average completion percentage, skipping null values
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
  


  async getContentEffectivenessReport(courseId: string) {
    // Fetch the course details
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException('Course not found.');
  
    // Fetch all modules associated with the course and sort them by `module_order`
    const modules = await this.moduleModel.find({ course_id: courseId }).sort({ module_order: 1 }).exec();
  
    // Handle the case when no modules are found
    let moduleDetails = [];
    let averageCourseRating: string | number = 'No rating yet'; // Allow both string and number types
    let validRatingCount = 0; // Count of modules with valid ratings
    let modulesWithRatings: any[] = []; // Store modules with valid ratings
  
    if (modules.length > 0) {
      // Calculate average course rating
      const validModuleRatings = modules
        .map((module) => module.module_rating)
        .filter((rating) => typeof rating === 'number' && !isNaN(rating)); // Only consider valid numerical ratings
  
      // Ensure that we only consider modules with at least one valid rating
      modulesWithRatings = modules.filter((module) => {
        const validRatingsForModule = module.module_rating && typeof module.module_rating === 'number';
        return validRatingsForModule;
      });
  
      validRatingCount = modulesWithRatings.length;
  
      if (validRatingCount > 0) {
        const totalRatings = validModuleRatings.reduce((sum, rating) => sum + rating, 0);
        averageCourseRating = parseFloat((totalRatings / validRatingCount).toFixed(2)); // Compute the average and round to 2 decimal places
      } else {
        averageCourseRating = 'No rating yet'; // If no valid ratings, return 'No rating yet'
      }
  
      // Prepare detailed module data with performance metrics
      moduleDetails = modules.map((module) => {
        const moduleRating = module.module_rating ?? 0; // Default to 0 if no rating
        let performanceMetric: string;
  
        // Skip modules that don't have any ratings (valid rating count must be at least 1)
        if (validRatingCount > 0 && typeof moduleRating === 'number' && moduleRating !== 0) {
          // Determine performance category for the module
          if (typeof averageCourseRating === 'number') {
            const lowerBoundary = averageCourseRating * 0.5;
            const upperBoundary = averageCourseRating * 1.2;
  
            if (moduleRating < lowerBoundary) {
              performanceMetric = 'Below Average';
            } else if (moduleRating >= lowerBoundary && moduleRating < averageCourseRating) {
              performanceMetric = 'Average';
            } else if (moduleRating >= averageCourseRating && moduleRating < upperBoundary) {
              performanceMetric = 'Above Average';
            } else {
              performanceMetric = 'Excellent';
            }
          } else {
            performanceMetric = 'No rating yet'; // When there's no average rating
          }
        } else {
          performanceMetric = 'No rating yet'; // If no valid ratings, mark the module as 'No rating yet'
        }
  
        return {
          title: `Module ${module.module_order}`, // Title for each module based on its order
          details: {
            moduleName: module.title,
            moduleOrder: module.module_order,
            moduleVersion: module.module_version,
            moduleRating: moduleRating || 'No rating yet',
            performanceMetric,
          },
        };
      });
    } else {
      // No modules present
      moduleDetails.push({ title: 'No modules available for this course.' });
    }
  
    // Retrieve course comments
    const comments = course.comments && course.comments.length > 0
      ? course.comments
      : ['No comments on the course!'];
  
    // Compile the final report
    return {
      courseRating: averageCourseRating,
      instructorRating: course.instructor_rating || 'No rating yet',
      comments, // Include comments or a default message
      modules: moduleDetails, // Each module with its title or default message
      validModuleCount: validRatingCount, // Count of modules with ratings
    };
  }
  
  
  
  

  


// Reports on Assessment Results
async getQuizResultsReport(courseId: string) {
  // Fetch progress records for the specific course
  const progress = await this.progressModel.find({ course_id: courseId }).exec();
  if (!progress || progress.length === 0) {
    throw new NotFoundException('No quiz results found for this course.');
  }

  // Calculate overall metrics (average score, performance categories)
  const quizResults = progress.map((p) => ({
    userId: p.user_id,
    userName: p.user_name,
    quizzesTaken: p.quizzes_taken || 0,
    lastQuizScore: p.last_quiz_score || 0,
    avgScore: p.avg_score || 0,
    quizGrades: p.quiz_grades || [], // Fetch quiz_grades array
  }));

  // Detailed per-quiz results
  const maxQuizzes = Math.max(...quizResults.map((record) => record.quizGrades.length));
  const quizzesDetails = [];

  for (let i = 0; i < maxQuizzes; i++) {
    const quizDetails = quizResults
      .filter((record) => record.quizGrades[i] !== undefined) // Include only students who took this quiz
      .map((record) => ({
        userId: record.userId,
        userName: record.userName,
        grade: record.quizGrades[i], // Grade for the current quiz
      }));

    quizzesDetails.push({
      quizNumber: i + 1, // Quiz numbers are 1-based
      participants: quizDetails.length,
      details: quizDetails, // List of students and their grades
    });
  }

  // Prepare the final report
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
