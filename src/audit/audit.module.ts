import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditController } from './audit.controller';
import { HttpModule } from '@nestjs/axios';
import { GithubModule } from '../github/github.module';
import { NpmRegistryService } from './services/npm-registry.service';

@Module({
  imports: [HttpModule, GithubModule],
  controllers: [AuditController],
  providers: [AuditService, NpmRegistryService],
  exports: [AuditService],
})
export class AuditModule {}
