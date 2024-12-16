export interface ProgressData {
    userId: string;
    studentName: string;
    gpa: number;
    totalCourses: number;
    courses: Course[];
  }
  
  export interface Course {
    courseId: string;
    courseName: string;
    progress: {
      completionPercentage: number;
      quizzesTaken: number;
      lastQuizScore: number;
      avgScore: number;
    };
    quizGrades: { quizNumber: number; grade: number | string }[];
    averageCourseScore: number;
    performanceMetric: string;
  }
  
  export interface EngagementData {
    totalEnrolledStudents: number;
    completedStudents: number;
  }
  
  export interface ModuleRating {
    moduleOrder: number;
    moduleName: string;
    moduleRating: number | "No rating yet";
    performanceMetric: string;
  }
  
  export interface ContentEffectivenessData {
    courseRating: number | "No rating yet";
    instructorRating: number | "No rating yet";
    modules: ModuleRating[];
  }
  