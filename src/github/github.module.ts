import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { AnalyzerModule } from '../analyzer/analyzer.module';

@Module({
  imports: [AnalyzerModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
