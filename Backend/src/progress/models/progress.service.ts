import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProgressDocument } from './progress.schema';
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
  // Fetch all progress records
  const progressRecords = await this.progressModel.find().exec();
  if (!progressRecords || progressRecords.length === 0) {
      throw new NotFoundException('No student progress data found.');
  }

  // Filter progress records for the specific course
  const courseProgressRecords = progressRecords.filter(record => record.course_id.toString() === courseId);

  if (!courseProgressRecords || courseProgressRecords.length === 0) {
      throw new NotFoundException('No engagement data found for this course.');
  }

  // Ensure the course exists
  const course = await this.courseModel.findById(courseId).exec();
  if (!course) {
      throw new NotFoundException('Course not found.');
  }

  // Total enrolled students
  const totalStudents = courseProgressRecords.length;

  // Students who completed the course
  const completedStudents = courseProgressRecords.filter(record => record.completion_percentage === 100).length;

  // Calculate average course score (average of avg_score for all students in this course)
  const totalAvgScore = courseProgressRecords.reduce((sum, record) => sum + (record.avg_score ?? 0), 0);
  const averageCourseScore = totalAvgScore / totalStudents;

  // Categorize students based on their average score
  const performanceCounts = {
      below_average: courseProgressRecords.filter(
          (record) => (record.avg_score ?? 0) < averageCourseScore * 0.5
      ).length, // Below 50% of the average course score
      average: courseProgressRecords.filter(
          (record) => (record.avg_score ?? 0) >= averageCourseScore * 0.5 && (record.avg_score ?? 0) < averageCourseScore
      ).length, // Between 50% and 100% of the average course score
      above_average: courseProgressRecords.filter(
          (record) => (record.avg_score ?? 0) >= averageCourseScore && (record.avg_score ?? 0) < averageCourseScore * 1.2
      ).length, // Between 100% and 120% of the average course score
      excellent: courseProgressRecords.filter(
          (record) => (record.avg_score ?? 0) >= averageCourseScore * 1.2
      ).length // Above 120% of the average course score
  };

  // Calculate average completion percentage
  const averageCompletionPercentage =
      courseProgressRecords.reduce((sum, record) => sum + record.completion_percentage, 0) / totalStudents;

  // Prepare the engagement report
  const engagementReport = {
      totalEnrolledStudents: totalStudents,
      completedStudents,
      performanceMetrics: performanceCounts,
      averageCompletionPercentage: parseFloat(averageCompletionPercentage.toFixed(2)), // Format as a number
      averageCourseScore: parseFloat(averageCourseScore.toFixed(2)) // Include average course score for reference
  };

  return engagementReport;
}



// Reports on Content Effectiveness
async getContentEffectivenessReport(courseId: string) {
  // Fetch the course and populate its modules
  const course = await this.courseModel.findById(courseId).populate('modules').exec();
  if (!course) throw new NotFoundException('Course not found.');

  // Fetch all modules for the course
  const modules = await this.moduleModel.find({ course_id: courseId }).exec();
  if (!modules.length) throw new NotFoundException('No modules found for this course.');

  // Calculate average course rating based on module ratings
  const validModuleRatings = modules
      .map((module) => module.module_rating)
      .filter((rating) => rating !== undefined && rating !== null);

  const averageCourseRating =
      validModuleRatings.length > 0
          ? validModuleRatings.reduce((sum, rating) => sum + rating, 0) / validModuleRatings.length
          : 'No rating yet';

  // Categorize modules based on their ratings
  const modulePerformance = {
      below_average: [],
      average: [],
      above_average: [],
      excellent: [],
  };

  const baselineRating = averageCourseRating !== 'No rating yet' ? averageCourseRating : 0;

  modules.forEach((module) => {
      const moduleRating = module.module_rating ?? 0;
      if (moduleRating < baselineRating * 0.5) {
          modulePerformance.below_average.push({
              moduleId: module._id,
              moduleName: module.title,
              rating: moduleRating,
          });
      } else if (moduleRating >= baselineRating * 0.5 && moduleRating < baselineRating) {
          modulePerformance.average.push({
              moduleId: module._id,
              moduleName: module.title,
              rating: moduleRating,
          });
      } else if (moduleRating >= baselineRating && moduleRating < baselineRating * 1.2) {
          modulePerformance.above_average.push({
              moduleId: module._id,
              moduleName: module.title,
              rating: moduleRating,
          });
      } else if (moduleRating >= baselineRating * 1.2) {
          modulePerformance.excellent.push({
              moduleId: module._id,
              moduleName: module.title,
              rating: moduleRating,
          });
      }
  });

  // Return the report
  return {
      courseRating: averageCourseRating,
      instructorRating: course.instructor_rating || 'No rating yet',
      modulePerformance,
  };
}




// Reports on Assessment Results
async getQuizResultsReport(courseId: string) {
  // Fetch progress records for the specific course
  const progress = await this.progressModel.find({ course_id: courseId }).exec();
  if (!progress || progress.length === 0) {
      throw new NotFoundException('No quiz results found for this course.');
  }

  // Extract individual quiz results and calculate overall metrics
  const quizResults = progress.map((p) => ({
      userId: p.user_id,
      quizzesTaken: p.quizzes_taken,
      lastQuizScore: p.last_quiz_score || 0,
      avgScore: p.avg_score || 0,
  }));

  // Calculate average scores across all students for the course
  const totalAvgScore = quizResults.reduce((sum, record) => sum + record.avgScore, 0);
  const averageCourseScore = totalAvgScore / quizResults.length;

  // Categorize students based on their average quiz score
  const performanceMetrics = {
      below_average: quizResults.filter(
          (record) => record.avgScore < averageCourseScore * 0.5
      ).length, // Below 50% of the average course score
      average: quizResults.filter(
          (record) => record.avgScore >= averageCourseScore * 0.5 && record.avgScore < averageCourseScore
      ).length, // Between 50% and 100% of the average course score
      above_average: quizResults.filter(
          (record) => record.avgScore >= averageCourseScore && record.avgScore < averageCourseScore * 1.2
      ).length, // Between 100% and 120% of the average course score
      excellent: quizResults.filter(
          (record) => record.avgScore >= averageCourseScore * 1.2
      ).length, // Above 120% of the average course score
  };

  // Collect detailed quiz results and categorization
  const detailedResults = quizResults.map((record) => ({
      userId: record.userId,
      quizzesTaken: record.quizzesTaken,
      lastQuizScore: record.lastQuizScore,
      avgScore: record.avgScore,
      performanceCategory:
          record.avgScore < averageCourseScore * 0.5
              ? 'Below Average'
              : record.avgScore >= averageCourseScore * 0.5 && record.avgScore < averageCourseScore
              ? 'Average'
              : record.avgScore >= averageCourseScore && record.avgScore < averageCourseScore * 1.2
              ? 'Above Average'
              : 'Excellent',
  }));

  // Prepare the final report
  return {
      averageCourseScore: parseFloat(averageCourseScore.toFixed(2)), // Format average score
      performanceMetrics,
      detailedResults,
  };
}


async getStudentReport(studentId: string) {
  // Fetch all progress records for the student
  const studentProgress = await this.progressModel.find({ user_id: studentId }).exec();
  if (!studentProgress || studentProgress.length === 0) {
      throw new NotFoundException(`No progress data found for student with ID: ${studentId}.`);
  }

  // Map over the progress records to generate a detailed report for each course
  const courseReports = await Promise.all(
      studentProgress.map(async (progress) => {
          // Fetch the course associated with the progress
          const course = await this.courseModel.findById(progress.course_id).exec();
          if (!course) {
              throw new NotFoundException(`Course with ID: ${progress.course_id} not found.`);
          }

          // Fetch modules for the course
          const modules = await this.moduleModel.find({ course_id: course._id }).exec();

          // Process module ratings
          const moduleRatings = modules.map((module) => ({
              moduleId: module._id,
              moduleName: module.title,
              rating: module.module_rating || 'No rating yet',
          }));

          // Quiz details from progress
          const quizzesTaken = progress.quizzes_taken || 0;
          const lastQuizScore = progress.last_quiz_score || 0;
          const avgScore = progress.avg_score || 0;

          // Prepare course-specific report
          return {
              courseId: course._id,
              courseName: course.title,
              courseRating: course.course_rating || 'No rating yet',
              instructorRating: course.instructor_rating || 'No rating yet',
              progress: {
                  completionPercentage: progress.completion_percentage,
                  quizzesTaken,
                  lastQuizScore,
                  avgScore,
              },
              moduleRatings,
          };
      })
  );

  // Compile the full student report
  return {
      studentId,
      totalCourses: courseReports.length,
      courses: courseReports,
  };
}



}
