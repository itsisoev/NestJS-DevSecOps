import { Request } from 'express';

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
}

export interface UploadedFileWithBuffer {
  buffer: Buffer;
}

export interface JwtPayload {
  githubAccessToken: string;
}

export type JwtRequest = Request & { user: JwtPayload };

export interface AuditResult {
  name: string;
  version: string;
  needsUpdate: boolean;
  latestVersion?: string;
  status: 'safe' | 'updateRecommended' | 'vulnerable';
  size?: number;
  sizeLabel?: 'small' | 'medium' | 'large';
}

export interface NpmPackageData {
  'dist-tags'?: { latest?: string };
  versions?: Record<string, { dist?: { unpackedSize?: number } }>;
}
