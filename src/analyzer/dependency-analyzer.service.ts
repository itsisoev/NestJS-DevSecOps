import { Injectable } from '@nestjs/common';
import * as madge from 'madge';
import simpleGit from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class DependencyAnalyzerService {
  async analyzeGithubRepo(owner: string, repo: string): Promise<any> {
    const tmpDir = path.join('/tmp', `${owner}-${repo}-${Date.now()}`);
    const gitUrl = `https://github.com/${owner}/${repo}.git`;

    try {
      await simpleGit().clone(gitUrl, tmpDir);
      const result = await madge(tmpDir, {
        fileExtensions: ['ts', 'js', 'tsx', 'jsx', 'vue'],
        includeNpm: false,
      });

      const graph = result.obj();
      return graph;
    } catch (err) {
      console.error('Analysis error:', err);
      return null;
    } finally {
      await fs.remove(tmpDir);
    }
  }
}
