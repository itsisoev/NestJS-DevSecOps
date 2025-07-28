import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GitHubProfile } from './user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findOrCreateByGithub(profile: GitHubProfile): Promise<User> {
    let user = await this.usersRepo.findOne({
      where: { githubId: profile.githubId },
    });

    if (user) {
      if (user.githubAccessToken !== profile.githubAccessToken) {
        user.githubAccessToken = profile.githubAccessToken;
        await this.usersRepo.save(user);
      }
      return user;
    }

    user = this.usersRepo.create({
      githubId: profile.githubId,
      username: profile.username,
      emails: profile.emails,
      photos: profile.photos,
      githubAccessToken: profile.githubAccessToken,
    });

    return this.usersRepo.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }
}
