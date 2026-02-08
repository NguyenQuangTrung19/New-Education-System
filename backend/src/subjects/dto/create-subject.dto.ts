import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
