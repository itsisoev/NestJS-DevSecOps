import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { HttpModule } from '@nestjs/axios';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}
