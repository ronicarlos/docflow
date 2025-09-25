import {ITrainingGuideLesson} from "@/types/ITrainingGuideLesson";

export interface ITrainingGuideModule {
    id: string;
    title: string;
    description: string;
    order: number;
    isActive: boolean;
    lessons: ITrainingGuideLesson[];
}