import { Module } from '@nestjs/common';
import { PublicAuditService } from './public-audit.service';
import { PublicAuditController } from './public-audit.controller';
import { HttpModule } from '@nestjs/axios';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [HttpModule, AuditModule],
  controllers: [PublicAuditController],
  providers: [PublicAuditService],
})
export class PublicAuditModule {}
