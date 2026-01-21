export class CreateScheduleDto {
    day: string;
    period: number;
    session: string; // Morning, Afternoon
    room?: string;
    subjectId: string;
    classId: string;
    teacherId?: string;
}
