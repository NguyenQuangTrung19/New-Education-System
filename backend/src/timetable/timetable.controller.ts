import { Controller, Post, Get, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TimetableService } from './timetable.service';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post('generate')
  async generateTimetable(@Body() config: any) {
    try {
        return await this.timetableService.generateSchedule();
    } catch (e: any) {
        if (e.message && e.message.includes('PRE_FLIGHT_ERROR')) {
             throw new BadRequestException(e.message.replace('PRE_FLIGHT_ERROR: ', ''));
        }
        throw new InternalServerErrorException(e.message || 'Timetable generation failed');
    }
  }
}
