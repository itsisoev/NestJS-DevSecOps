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
  vulnerabilities?: OssVuln[];
}

export interface AuditResponse {
  message: string;
  results: AuditResult[];
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

export interface OssVuln {
  id: string;
  title: string;
  description: string;
  cvssScore: number;
  cve: string;
  reference: string;
  severity: string;
}

export interface OssIndexResponse {
  coordinates: string;
  vulnerabilities: OssVuln[];
}

export interface UploadedFileWithBuffer {
  buffer: Buffer;
}

export interface CachedAuditResult {
  hash: string;
  message: string;
  results: AuditResult[];
}