import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { progress, ProgressDocument } from './progress.schema';
import { CourseDocument } from '../../courses/course.schema';
import { ModuleDocument } from '../../modules/module.schema';

@Injectable()
export class ProgressService {
  constructor(@InjectModel('progress') private readonly progressModel: Model<ProgressDocument>,
  @InjectModel('course') private readonly courseModel: Model<CourseDocument>,
  @InjectModel('module') private readonly moduleModel: Model<ModuleDocument>
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
  
    const performanceCounts = {
      below_average: courseProgressRecords.filter(
        (record) => record.avg_score !== null && record.avg_score < averageCourseScore * 0.5
      ).length,
      average: courseProgressRecords.filter(
        (record) =>
          record.avg_score !== null &&
          record.avg_score >= averageCourseScore * 0.5 &&
          record.avg_score < averageCourseScore
      ).length,
      above_average: courseProgressRecords.filter(
        (record) =>
          record.avg_score !== null &&
          record.avg_score >= averageCourseScore &&
          record.avg_score < averageCourseScore * 1.2
      ).length,
      excellent: courseProgressRecords.filter(
        (record) => record.avg_score !== null && record.avg_score >= averageCourseScore * 1.2
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
  


// Reports on Content Effectiveness; Ratings
async getContentEffectivenessReport(courseId: string) {
  // Fetch the course details
  const course = await this.courseModel.findById(courseId).exec();
  if (!course) throw new NotFoundException('Course not found.');

  // Fetch all modules associated with the course and sort them by `module_order`
  const modules = await this.moduleModel.find({ course_id: courseId }).sort({ module_order: 1 }).exec();
  if (!modules.length) throw new NotFoundException('No modules found for this course.');

  // Calculate average course rating
  const validModuleRatings = modules
    .map((module) => module.module_rating)
    .filter((rating) => rating !== null); // Exclude null ratings

  const totalRatings = validModuleRatings.reduce((sum, rating) => sum + rating, 0);
  const averageCourseRating =
    validModuleRatings.length > 0 ? totalRatings / validModuleRatings.length : 0;

  // Prepare detailed module data
  const moduleDetails = modules.map((module) => {
    const moduleRating = module.module_rating ?? 0;
    let performanceMetric: string;

    // Determine performance category for the module
    if (moduleRating < averageCourseRating * 0.5) {
      performanceMetric = 'Below Average';
    } else if (moduleRating >= averageCourseRating * 0.5 && moduleRating < averageCourseRating) {
      performanceMetric = 'Average';
    } else if (moduleRating >= averageCourseRating && moduleRating < averageCourseRating * 1.2) {
      performanceMetric = 'Above Average';
    } else {
      performanceMetric = 'Excellent';
    }

    return {
      title: `Module ${module.module_order}`, // Title for each module based on its order
      details: {
        moduleId: module._id,
        moduleName: module.title,
        moduleOrder: module.module_order,
        moduleRating: module.module_rating || 'No rating yet',
        performanceMetric,
      },
    };
  });

  // Compile the final report
  return {
    courseRating: parseFloat(averageCourseRating.toFixed(2)) || 'No rating yet',
    instructorRating: course.instructor_rating || 'No rating yet',
    modules: moduleDetails, // Each module with its title
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

  

async getStudentReport(userId: string) {
  // Fetch all progress records for the student
  const studentProgress = await this.progressModel.find({ user_id: userId }).exec();
  if (!studentProgress || studentProgress.length === 0) {
    throw new NotFoundException(`No progress data found for student with ID: ${userId}.`);
  }

  // Extract the student's name from the first progress record
  const studentName = studentProgress[0].user_name;

  // Map over the progress records to generate a detailed report for each course
  const courseReports = await Promise.all(
    studentProgress.map(async (progress) => {
      // Fetch the course associated with the progress
      const course = await this.courseModel.findById(progress.course_id).exec();
      if (!course) {
        throw new NotFoundException(`Course with ID: ${progress.course_id} not found.`);
      }

      // Quiz details from progress
      const quizzesTaken = progress.quizzes_taken || 0;
      const lastQuizScore = progress.last_quiz_score || 0;
      const avgScore = progress.avg_score || 0;

      // Process quiz grades
      const quizGradesDetails = (progress.quiz_grades || []).map((grade, index) => ({
        quizNumber: index + 1, // Quiz number (1-based)
        grade: grade !== null ? grade : 'Not Attempted', // Show "Not Attempted" if null
      }));

      // Prepare course-specific report
      return {
        courseId: course._id,
        courseName: course.title,
        progress: {
          completionPercentage: progress.completion_percentage,
          quizzesTaken,
          lastQuizScore,
          avgScore,
        },
        quizGrades: quizGradesDetails, // Include detailed quiz grades
      };
    })
  );

  // Compile the full student report
  return {
    userId,
    studentName, // Use the user_name from progress records
    totalCourses: courseReports.length,
    courses: courseReports,
  };
}



}
