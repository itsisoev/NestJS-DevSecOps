import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GitHubProfile } from './user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findOrCreateByGithub(profile: GitHubProfile): Promise<User> {
    const existing = await this.usersRepo.findOne({
      where: { githubId: profile.githubId },
    });
    if (existing) return existing;

    const user = this.usersRepo.create(profile);
    return this.usersRepo.save(user);
  }
}
