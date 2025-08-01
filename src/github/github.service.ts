import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GithubRepo } from './github.interface';

@Injectable()
export class GithubService {
  async getUserRepos(token: string): Promise<GithubRepo[]> {
    const res = await axios.get<GithubRepo[]>(
      'https://api.github.com/user/repos',
      {
        headers: { Authorization: `token ${token}` },
      },
    );
    return res.data;
  }

  async getPackageJson(
    token: string,
    owner: string,
    repo: string,
  ): Promise<Record<string, any> | null> {
    try {
      const res = await axios.get<{
        content: string;
        encoding: string;
      }>(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
        {
          headers: { Authorization: `token ${token}` },
        },
      );

      const content = res.data?.content;

      if (!content) {
        return null;
      }

      const decoded = Buffer.from(content, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (err) {
      return null;
    }
  }
}
