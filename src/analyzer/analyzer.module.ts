import { Module } from '@nestjs/common';
import { DependencyAnalyzerService } from './dependency-analyzer.service';

@Module({
  providers: [DependencyAnalyzerService],
  exports: [DependencyAnalyzerService],
})
export class AnalyzerModule {}
