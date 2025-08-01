import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DependencyAnalyzerService } from '../analyzer/dependency-analyzer.service';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly analyzerService: DependencyAnalyzerService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('repos')
  async getRepos(@Req() req: Request & { user: any }) {
    const token = req.user.githubAccessToken;
    return this.githubService.getUserRepos(token);
  }

  @Get('package-json/:owner/:repo')
  @UseGuards(JwtAuthGuard)
  async getPackageJson(
    @Req() req: Request & { user: any },
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const token = req.user.githubAccessToken;
    return this.githubService.getPackageJson(token, owner, repo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dependency-graph/:owner/:repo')
  async getDependencyGraph(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.analyzerService.analyzeGithubRepo(owner, repo);
  }
}
