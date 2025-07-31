import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PublicAuditService } from './public-audit.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CachedAuditResult,
  UploadedFileWithBuffer,
} from './public-audit.interface';

@Controller('public-audit')
export class PublicAuditController {
  constructor(private readonly publicAuditService: PublicAuditService) {}

  @Post('check-package')
  @UseInterceptors(FileInterceptor('file'))
  async checkPackage(
    @UploadedFile() file: UploadedFileWithBuffer,
  ): Promise<CachedAuditResult> {
    if (!file?.buffer) {
      throw new BadRequestException('Файл не найден или пустой');
    }

    const content = file.buffer.toString('utf8');

    try {
      return await this.publicAuditService.analyzeAndCache(content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ошибка анализа';
      throw new BadRequestException(msg);
    }
  }

  @Get('result/:hash')
  async getResult(@Param('hash') hash: string) {
    const cached = await this.publicAuditService.getCachedResult(hash);
    if (!cached) {
      throw new BadRequestException('Результат не найден или устарел');
    }
    return { hash, ...cached };
  }
}
