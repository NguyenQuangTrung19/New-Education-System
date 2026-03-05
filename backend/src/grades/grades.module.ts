import { Module } from '@nestjs/common';
// Force IDE cache refresh
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';

@Module({
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
