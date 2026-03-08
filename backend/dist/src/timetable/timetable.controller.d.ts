import { TimetableService } from './timetable.service';
export declare class TimetableController {
    private readonly timetableService;
    constructor(timetableService: TimetableService);
    generateTimetable(config: any): Promise<any>;
}
