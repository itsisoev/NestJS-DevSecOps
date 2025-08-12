import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GitHubValidatePayload {
  githubId: string;
  username: string;
  emails?: string;
  photos?: string;
  githubAccessToken: string;
}

interface GithubProfile {
  id: string;
  username: string;
  emails?: { value: string }[] | undefined;
  photos?: { value: string }[] | undefined;
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'notifications'],
    });
  }

  validate(
    accessToken: string,
    __: string,
    profile: GithubProfile,
  ): GitHubValidatePayload {
    return {
      githubId: profile.id,
      username: profile.username,
      emails: profile.emails?.[0]?.value,
      photos: profile.photos?.[0]?.value,
      githubAccessToken: accessToken,
    };
  }
}
