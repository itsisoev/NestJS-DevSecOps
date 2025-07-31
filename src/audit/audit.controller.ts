import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuditService } from './services/audit.service';
import { GithubService } from 'src/github/github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtRequest, PackageJson, UploadedFileWithBuffer } from './types/audit';
import { PdfGeneratorService } from '../pdf/pdf-generator.service';
import { Response } from 'express';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly githubService: GithubService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post('check-package')
  @UseInterceptors(FileInterceptor('file'))
  async checkPackage(@UploadedFile() file: UploadedFileWithBuffer) {
    if (!file?.buffer) {
      throw new Error('Файл не найден или пустой');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(file.buffer.toString('utf-8'));
    } catch {
      throw new Error('Ошибка парсинга JSON');
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (!('dependencies' in parsed) && !('devDependencies' in parsed))
    ) {
      throw new Error('Неверный формат package.json');
    }

    const pkg = parsed as PackageJson;
    const projectName =
      typeof pkg.name === 'string' ? pkg.name : 'Без названия';

    return this.auditService.analyzeDependencies(pkg, projectName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('github/:owner/:repo')
  async analyzeGitHubPackageJson(
    @Req() req: JwtRequest,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const token = req.user.githubAccessToken;
    const rawPkg = await this.githubService.getPackageJson(token, owner, repo);

    const isValid =
      typeof rawPkg === 'object' &&
      rawPkg !== null &&
      ('dependencies' in rawPkg || 'devDependencies' in rawPkg);

    if (!isValid) {
      return {
        projectName: `${repo}`,
        message: 'package.json не найден или некорректный',
        results: [],
      };
    }

    const pkg = rawPkg as PackageJson;
    const projectName = `${repo}`;
    return this.auditService.analyzeDependencies(pkg, projectName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('github/:owner/:repo/pdf')
  async downloadRepoPdf(
    @Req() req: JwtRequest,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Res() res: Response,
  ) {
    const token = req.user.githubAccessToken;
    const rawPkg = await this.githubService.getPackageJson(token, owner, repo);

    const isValid =
      typeof rawPkg === 'object' &&
      rawPkg !== null &&
      ('dependencies' in rawPkg || 'devDependencies' in rawPkg);

    if (!isValid) {
      res.status(404).send('package.json не найден или некорректный');
      return;
    }

    const pkg = rawPkg as PackageJson;
    const projectName = repo;

    const analysis = await this.auditService.analyzeDependencies(
      pkg,
      projectName,
    );
    const pdfBuffer = await this.pdfGeneratorService.generateReport(
      analysis.projectName,
      analysis.results,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${projectName}_audit_report.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
