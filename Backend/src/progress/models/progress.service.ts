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

   // Reports on students' engagement
   async getStudentsEngagementReport(courseId: string) {
    const progress = await this.progressModel.find({ course_id: courseId }).exec();
    if (!progress) throw new NotFoundException('No student engagement data found for this course.');

    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException('Course not found.');

    const totalStudents = course.enrolled_students;
    const completedStudents = progress.filter((p) => p.completion_percentage === 100).length;
    const averageCompletion = progress.reduce((sum, p) => sum + p.completion_percentage, 0) / totalStudents;
    const averageQuizScore = progress.reduce((sum, p) => sum + (p.last_quiz_score ?? 0), 0) / totalStudents;
    const quizAverages = [];
    const totalQuizzes = course.nom_of_modules || 0;

    for (let i = 0; i < totalQuizzes; i++) {
      const quizSum = progress.reduce((sum, p) => sum + (p.quizzes_taken[i]?.score || 0), 0);
      quizAverages.push(quizSum / totalStudents);
    }
    const averageCourseScore = quizAverages.reduce((sum, avg) => sum + avg, 0) / totalQuizzes;

    // Adjust performance categories based on the average course score
    const performanceCounts = {
      below_average: progress.filter((p) => p.avg_score < averageCourseScore * 0.5).length, // Below 50% of the average course score
      average: progress.filter((p) => p.avg_score >= averageCourseScore * 0.5 && p.avg_score < averageCourseScore).length, // Between 50% and 100% of the average course score
      above_average: progress.filter((p) => p.avg_score >= averageCourseScore && p.avg_score < averageCourseScore * 1.2).length, // Between 100% and 120% of the average course score
      excellent: progress.filter((p) => p.avg_score >= averageCourseScore * 1.2).length, // Above 120% of the average course score
    };
    // const performanceCounts = {
    //   below_average: progress.filter((p) => p.avg_score < 50).length,
    //   average: progress.filter((p) => p.avg_score >= 50 && p.avg_score < 70).length,
    //   above_average: progress.filter((p) => p.avg_score >= 70 && p.avg_score < 90).length,
    //   excellent: progress.filter((p) => p.avg_score >= 90).length,
    // };

    return {
      totalStudents,
      completedStudents,
      averageCompletion,
      averageQuizScore,
      performanceCounts,
    };
  }

   // Reports on Content Effectiveness
   async getContentEffectivenessReport(courseId: string) {
    const course = await this.courseModel.findById(courseId).populate('modules').exec();
    if (!course) throw new NotFoundException('Course not found.');

    const modules = await this.moduleModel.find({ course_id: courseId }).exec();
    if (!modules.length) throw new NotFoundException('No modules found for this course.');


    const moduleRatings = modules.map((module) => ({
      moduleId: module._id,
      moduleName: module.title,
      rating: module.module_rating || 'No rating yet',
    }));

    return {
      courseRating: course.course_rating || 'No rating yet',
     // instructorId: course.instructor_id,
      instructorRating: course.instructor_rating || 'No rating yet',
      moduleRatings,
    };
  }

  // Reports on Assessment Results
  async getQuizResultsReport(courseId: string) {
    const progress = await this.progressModel.find({ course_id: courseId }).exec();
    if (!progress) throw new NotFoundException('No quiz results found for this course.');

    const quizResults = progress.map((p) => ({
      userId: p.user_id,
      quizzesTaken: p.quizzes_taken,
      lastQuizScore: p.last_quiz_score,
      avgScore: p.avg_score,
    }));

    return { quizResults };
  }

}
