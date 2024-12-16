export class CreateCourseDto {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  created_by: string;
  version: number;
  course_rating: number;
  ratingCount: number;
  enrolled_students: number;
  nom_of_modules: number;
  keywords: string[];
  isAvailable: boolean;
  instructor_id: string; 
}
