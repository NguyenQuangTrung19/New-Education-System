import { LessonFeedbackService } from './lesson-feedback.service';
import { CreateLessonFeedbackDto } from './dto/create-lesson-feedback.dto';
import { UpdateLessonFeedbackDto } from './dto/update-lesson-feedback.dto';
export declare class LessonFeedbackController {
    private readonly lessonFeedbackService;
    constructor(lessonFeedbackService: LessonFeedbackService);
    create(createLessonFeedbackDto: CreateLessonFeedbackDto): Promise<{
        id: string;
        scheduleId: string;
        date: string;
        rating: string;
        comment: string;
        signature: string;
        timestamp: Date;
    }>;
    findAll(teacherId?: string, classId?: string): never[] | Promise<({
        schedule: {
            id: string;
            classId: string;
            room: string | null;
            teacherId: string | null;
            day: string;
            subjectId: string;
            period: number;
            session: string;
            weekStartDate: Date | null;
        };
    } & {
        id: string;
        scheduleId: string;
        date: string;
        rating: string;
        comment: string;
        signature: string;
        timestamp: Date;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        scheduleId: string;
        date: string;
        rating: string;
        comment: string;
        signature: string;
        timestamp: Date;
    }>;
    update(id: string, updateLessonFeedbackDto: UpdateLessonFeedbackDto): Promise<{
        id: string;
        scheduleId: string;
        date: string;
        rating: string;
        comment: string;
        signature: string;
        timestamp: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        scheduleId: string;
        date: string;
        rating: string;
        comment: string;
        signature: string;
        timestamp: Date;
    }>;
}
