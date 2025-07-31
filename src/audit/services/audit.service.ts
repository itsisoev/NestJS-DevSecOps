import { Injectable } from '@nestjs/common';
import * as semver from 'semver';
import { PackageJson, AuditResult } from '../types/audit';
import { NpmRegistryService } from './npm-registry.service';

@Injectable()
export class AuditService {
  constructor(private readonly npmRegistry: NpmRegistryService) {}

  private determineSizeLabel(size?: number): AuditResult['sizeLabel'] {
    if (size === undefined) return undefined;
    if (size < 100 * 1024) return 'small';
    if (size < 500 * 1024) return 'medium';
    return 'large';
  }

  private determineStatus(
    currentVersion: string,
    latestVersion: string,
  ): AuditResult['status'] {
    if (!latestVersion || latestVersion === 'unknown') return 'safe';

    if (semver.validRange(currentVersion)) {
      if (!semver.satisfies(latestVersion, currentVersion)) {
        return 'updateRecommended';
      }
    } else {
      const coerced = semver.coerce(currentVersion) ?? '0.0.0';
      if (semver.lt(coerced, latestVersion)) {
        return 'updateRecommended';
      }
    }
    return 'safe';
  }

  async analyzeDependencies(
    pkg: PackageJson,
    projectName: string = 'Без названия',
  ): Promise<{ projectName: string; message: string; results: AuditResult[] }> {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const results: AuditResult[] = [];

    for (const [name, version] of Object.entries(deps)) {
      if (typeof version !== 'string') continue;

      const data = await this.npmRegistry.fetchPackageData(name);

      const latestVersion = data?.['dist-tags']?.latest ?? 'unknown';
      const latestData = data?.versions?.[latestVersion];
      const size = latestData?.dist?.unpackedSize;

      const sizeLabel = this.determineSizeLabel(size);
      const status = this.determineStatus(version, latestVersion);
      const needsUpdate = version.includes('^') || version.includes('~');

      results.push({
        name,
        version,
        needsUpdate,
        latestVersion,
        status,
        size,
        sizeLabel,
      });
    }

    return {
      projectName,
      message: 'Анализ завершен',
      results,
    };
  }
}
