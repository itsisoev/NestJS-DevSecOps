import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { FileInterceptor } from '@nestjs/platform-express';

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

interface UploadedFileWithBuffer {
  buffer: Buffer;
}

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('check-package')
  @UseInterceptors(FileInterceptor('file'))
  checkPackage(@UploadedFile() file: UploadedFileWithBuffer) {
    if (!file?.buffer) {
      throw new Error('Файл не найден или пустой');
    }

    let json: unknown;
    try {
      json = JSON.parse(file.buffer.toString());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
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
}
