export interface ITrainingGuideLesson {
    id: string;
    title: string;
    content: string;
    order: number;
    duration: number;
    isCompleted: boolean;
    moduleId: string;
    label: string;
    href: string;
    aiTip: string;
}