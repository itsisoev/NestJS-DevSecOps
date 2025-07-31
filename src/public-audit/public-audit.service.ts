import { Injectable, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  PackageJson,
  AuditResponse,
  CachedAuditResult,
} from './public-audit.interface';
import { AuditService } from '../audit/services/audit.service';

@Injectable()
export class PublicAuditService {
  private readonly CACHE_TTL = 600; // 10 минут

  constructor(
    private readonly auditService: AuditService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async analyzeAndCache(pkgContent: string): Promise<CachedAuditResult> {
    const hash = createHash('sha256').update(pkgContent).digest('hex');
    const cacheKey = `audit-result:${hash}`;

    const cached = await this.cacheManager.get<AuditResponse>(cacheKey);
    if (cached) return { hash, ...cached };

    let pkg: PackageJson;
    try {
      const parsed = JSON.parse(pkgContent) as unknown;
      pkg = parsed as PackageJson;
    } catch {
      throw new Error('Невалидный JSON');
    }

    if (!pkg.dependencies && !pkg.devDependencies) {
      throw new Error('Нет зависимостей для анализа');
    }

    const analysis = await this.auditService.analyzeDependencies(pkg);
    await this.cacheManager.set(cacheKey, analysis, this.CACHE_TTL);
    return { hash, ...analysis };
  }

  public async getCachedResult(
    hash: string,
  ): Promise<AuditResponse | undefined> {
    return this.cacheManager.get<AuditResponse>(`audit-result:${hash}`);
  }
}
