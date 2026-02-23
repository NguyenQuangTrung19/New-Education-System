import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teaching-assignments')
export class TeachingAssignmentsController {
  constructor(private readonly assignmentsService: TeachingAssignmentsService) {}

  @Get()
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Post('bulk')
  bulkSave(@Body() payload: any[]) {
    return this.assignmentsService.bulkSave(payload);
  }
}
