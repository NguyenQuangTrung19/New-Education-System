import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateScheduleDto {
    @IsString()
    @IsNotEmpty()
    day: string;

    @IsInt()
    @Min(1)
    period: number;

    @IsString()
    @IsNotEmpty()
    session: string; // Morning, Afternoon

    @IsString()
    @IsOptional()
    room?: string;

    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @IsString()
    @IsNotEmpty()
    classId: string;

    @IsString()
    @IsOptional()
    teacherId?: string;
}
