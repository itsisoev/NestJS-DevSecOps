import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { GitHubProfile } from '../users/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: Request & { user: GitHubProfile },
    @Res() res: Response,
  ) {
    console.log('🔐 GitHub OAuth User:', req.user);
    const token = await this.authService.validateOAuthLogin(req.user);
    res.redirect(
      `http://localhost:4200/login/success?token=${token.access_token}`,
    );
  }
}
