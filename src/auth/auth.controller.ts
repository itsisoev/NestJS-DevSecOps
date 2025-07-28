import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    const token = await this.authService.validateOAuthLogin(req.user);
    res.redirect(
      `http://localhost:4200/login/success?token=${token.access_token}`,
    );
  }
}
