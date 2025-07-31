export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type AuditStatus = 'safe' | 'updateRecommended' | 'vulnerable';

export interface AuditResult {
  name: string;
  version: string;
  needsUpdate: boolean;
  latestVersion?: string;
  status: AuditStatus;
}

export interface AuditResponse {
  message: string;
  results: AuditResult[];
  projectName: string;
}

export interface CachedAuditResult {
  hash: string;
  message: string;
  results: AuditResult[];
}

export interface NpmPackageResponse {
  version: string;

  [key: string]: unknown;
}

export interface UploadedFileWithBuffer {
  buffer: Buffer;
}
