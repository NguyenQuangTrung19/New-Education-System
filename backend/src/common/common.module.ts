import { Module, Global } from '@nestjs/common';
import { IdGeneratorService } from './id-generator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordService } from './password.service';
import { RolesGuard } from '../auth/roles.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [IdGeneratorService, PasswordService, RolesGuard],
  exports: [IdGeneratorService, PasswordService, RolesGuard],
})
export class CommonModule {}
