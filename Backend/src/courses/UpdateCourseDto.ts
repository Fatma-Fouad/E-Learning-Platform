export class UpdateCourseDto {
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    isOutdated: boolean; 
    version: number; 
    previousVersion: string; 
    course_rating: number;
    ratingCount: number;
    multimedia: string [];
    enrolled_students: number; 
    nom_of_modules: number;
  }
  