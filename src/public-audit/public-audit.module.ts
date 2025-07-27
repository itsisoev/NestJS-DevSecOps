import { Module } from '@nestjs/common';
import { PublicAuditService } from './public-audit.service';
import { PublicAuditController } from './public-audit.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PublicAuditController],
  providers: [PublicAuditService],
})
export class PublicAuditModule {}
