import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as semver from 'semver';
import { createHash } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  AuditResponse,
  AuditResult,
  AuditStatus,
  CachedAuditResult,
  NpmPackageResponse,
  OssIndexResponse,
  OssVuln,
  PackageJson,
} from './public-audit.interface';

@Injectable()
export class PublicAuditService {
  private readonly CACHE_TTL = 600;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async getLatestVersion(packageName: string): Promise<string> {
    const cacheKey = `latest-version:npm:${packageName}`;
    const cachedVersion = await this.cacheManager.get<string>(cacheKey);
    if (cachedVersion) return cachedVersion;

    try {
      const response = await lastValueFrom(
        this.httpService.get<NpmPackageResponse>(
          `https://registry.npmjs.org/${packageName}/latest`,
        ),
      );
      const latestVersion = response.data?.version;
      if (latestVersion) {
        await this.cacheManager.set(cacheKey, latestVersion, this.CACHE_TTL);
        return latestVersion;
      }
    } catch (error) {
      console.error(`Failed to fetch version for ${packageName}`, error);
    }
    await this.cacheManager.set(cacheKey, 'unknown', this.CACHE_TTL);
    return 'unknown';
  }

  private determineStatus(
    currentVersion: string,
    latestVersion: string,
  ): AuditStatus {
    if (latestVersion === 'unknown') return 'safe';

    const validRange = semver.validRange(currentVersion);
    if (validRange && semver.satisfies(latestVersion, validRange)) {
      return 'safe';
    }

    const coerced = semver.coerce(currentVersion);
    if (coerced && semver.lt(coerced.version, latestVersion)) {
      return 'updateRecommended';
    }

    return 'safe';
  }

  private async getVulnerabilities(
    name: string,
    version: string,
  ): Promise<OssVuln[]> {
    const coordinates = `pkg:npm/${name}@${version}`;
    console.log(`Fetching vulnerabilities for: ${coordinates}`);
    const cacheKey = `ossindex:vuln:${coordinates}`;
    const cached = await this.cacheManager.get<OssVuln[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await lastValueFrom(
        this.httpService.post<OssIndexResponse[]>(
          'https://ossindex.sonatype.org/api/v3/component-report',
          { coordinates: [coordinates] },
          {
            headers: {
              'Content-Type':
                'application/vnd.ossindex.component-report.v1+json',
            },
          },
        ),
      );
      const vulns = response.data?.[0]?.vulnerabilities ?? [];
      await this.cacheManager.set(cacheKey, vulns, this.CACHE_TTL);
      return vulns;
    } catch (e) {
      console.warn(`Failed to get vulnerabilities for ${name}@${version}`);
      await this.cacheManager.set(cacheKey, [], this.CACHE_TTL);
      return [];
    }
  }

  public async analyzeDependencies(pkg: PackageJson): Promise<AuditResponse> {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const results: AuditResult[] = [];

    for (const [name, version] of Object.entries(deps)) {
      const latestVersion = await this.getLatestVersion(name);
      const needsUpdate = version.startsWith('^') || version.startsWith('~');
      let status = this.determineStatus(version, latestVersion);

      console.log(`Package: ${name}, declared version: ${version}`);

      // ВАЖНО: используем точную версию для поиска уязвимостей
      const parsedVersion = semver.coerce(version)?.version;

      console.log(
        `Package: ${name}, parsed version for vulnerabilities: ${parsedVersion}`,
      );

      const vulnerabilities = parsedVersion
        ? await this.getVulnerabilities(name, parsedVersion)
        : [];

      if (vulnerabilities.length > 0) status = 'vulnerable';

      results.push({
        name,
        version,
        needsUpdate,
        latestVersion: latestVersion !== 'unknown' ? latestVersion : undefined,
        status,
        vulnerabilities,
      });
    }

    return { message: 'Анализ завершен', results };
  }

  public async analyzeAndCache(pkgContent: string): Promise<CachedAuditResult> {
    const hash = createHash('sha256').update(pkgContent).digest('hex');
    const cacheKey = `audit-result:${hash}`;
    const cached = await this.cacheManager.get<AuditResponse>(cacheKey);
    if (cached) return { hash, ...cached };

    let pkg: PackageJson;
    try {
      pkg = JSON.parse(pkgContent);
    } catch (e) {
      throw new Error('Невалидный JSON');
    }

    if (!pkg.dependencies && !pkg.devDependencies) {
      throw new Error('Нет зависимостей для анализа');
    }

    const analysis = await this.analyzeDependencies(pkg);
    await this.cacheManager.set(cacheKey, analysis, this.CACHE_TTL);
    return { hash, ...analysis };
  }

  public async getCachedResult(
    hash: string,
  ): Promise<AuditResponse | undefined> {
    return this.cacheManager.get<AuditResponse>(`audit-result:${hash}`);
  }
}
