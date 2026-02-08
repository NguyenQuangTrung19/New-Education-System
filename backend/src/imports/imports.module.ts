
import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';
import { PasswordService } from '../common/password.service';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService, PrismaService, IdGeneratorService, PasswordService],
})
export class ImportsModule {}
