export interface TrainingModule {
  id: string;
  title: string;
  lessons: TrainingLesson[];
}

export interface TrainingLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  content: string;
  attachments?: any[];
}