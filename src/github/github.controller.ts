import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @UseGuards(JwtAuthGuard)
  @Get('repos')
  async getRepos(@Req() req: Request & { user: any }) {
    const token = req.user.githubAccessToken;
    return this.githubService.getUserRepos(token);
  }
}
