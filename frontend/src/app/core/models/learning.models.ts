export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LearningContent {
  resourceType: string;
  title: string;
  description: string;
  useCases: string[];
  quiz: QuizQuestion;
}
