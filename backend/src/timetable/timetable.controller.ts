import { Controller, Post, Get, Body } from '@nestjs/common';
import { TimetableService } from './timetable.service';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post('generate')
  async generateTimetable(@Body() config: any) {
    // In a real scenario, this would accept academic year or specific parameters
    return this.timetableService.generateSchedule();
  }
}
