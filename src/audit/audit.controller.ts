import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuditService } from './services/audit.service';
import { GithubService } from 'src/github/github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtRequest, PackageJson, UploadedFileWithBuffer } from './types/audit';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly githubService: GithubService,
  ) {}

  @Post('check-package')
  @UseInterceptors(FileInterceptor('file'))
  async checkPackage(@UploadedFile() file: UploadedFileWithBuffer) {
    if (!file?.buffer) {
      throw new Error('Файл не найден или пустой');
    }

    let json: unknown;
    try {
      json = JSON.parse(file.buffer.toString('utf-8'));
    } catch {
      throw new Error('Ошибка парсинга JSON');
    }

    if (
      typeof json !== 'object' ||
      json === null ||
      (!('dependencies' in json) && !('devDependencies' in json))
    ) {
      throw new Error('Неверный формат package.json');
    }

    return this.auditService.analyzeDependencies(json as PackageJson);
  }

  @UseGuards(JwtAuthGuard)
  @Get('github/:owner/:repo')
  async analyzeGitHubPackageJson(
    @Req() req: JwtRequest,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const token = req.user.githubAccessToken;
    const pkg = await this.githubService.getPackageJson(token, owner, repo);

    if (!pkg || typeof pkg !== 'object') {
      return {
        message: 'package.json не найден или некорректный',
        results: [],
      };
    }

    return this.auditService.analyzeDependencies(pkg);
  }
}
