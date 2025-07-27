import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import * as semver from 'semver';
import { HttpService } from '@nestjs/axios';

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type AuditResult = {
  name: string;
  version: string;
  needsUpdate: boolean;
  latestVersion?: string;
  status: 'safe' | 'updateRecommended' | 'vulnerable';
};

@Injectable()
export class AuditService {
  constructor(private readonly httpService: HttpService) {}

  async analyzeDependencies(
    pkg: PackageJson,
  ): Promise<{ message: string; results: AuditResult[] }> {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const results: AuditResult[] = [];

    for (const [name, version] of Object.entries(deps)) {
      if (typeof version !== 'string') continue;

      // Получаем последнюю версию из npm
      let latestVersion = '';
      try {
        const response = await lastValueFrom(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          this.httpService.get(`https://registry.npmjs.org/${name}/latest`),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        // @ts-ignore
        latestVersion = response.data.version;
      } catch {
        latestVersion = 'unknown';
      }

      // Проверяем, нужна ли обновление
      const needsUpdate = version.includes('^') || version.includes('~');

      // Определяем статус
      let status: AuditResult['status'] = 'safe';
      if (latestVersion !== 'unknown') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        if (semver.validRange(version)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          if (!semver.satisfies(latestVersion, version)) {
            status = 'updateRecommended';
          }
        } else if (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          semver.lt(semver.coerce(version) ?? '0.0.0', latestVersion)
        ) {
          status = 'updateRecommended';
        }
      }

      results.push({ name, version, needsUpdate, latestVersion, status });
    }

    return {
      message: 'Анализ завершен',
      results,
    };
  }
}
