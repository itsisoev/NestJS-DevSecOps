import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { AuditResult } from '../audit/types/audit';
import { promises as fs } from 'fs';

@Injectable()
export class PdfGeneratorService {
  async generateReport(
    projectName: string,
    results: AuditResult[],
  ): Promise<Buffer> {
    const html = await this.generateHtml(projectName, results);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  private formatSize(bytes: number | undefined): string {
    if (bytes === undefined || bytes === null) return '-';
    const kb = 1024;
    if (bytes < kb) return bytes + ' B';
    if (bytes < kb * kb) return (bytes / kb).toFixed(1) + ' KB';
    return (bytes / (kb * kb)).toFixed(2) + ' MB';
  }

  private getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'updaterecommended':
        return '#e67e22';
      case 'safe':
        return '#27ae60';
      default:
        return '#c0392b';
    }
  }

  private async generateHtml(
    projectName: string,
    results: AuditResult[],
  ): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', 'report.hbs');
    const source = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(source);

    const preparedResults = results.map((r) => ({
      ...r,
      sizeLabel: this.formatSize(r.size),
      statusColor: this.getStatusColor(r.status),
    }));

    const html = template({
      projectName,
      generatedAt: new Date().toLocaleString(),
      results: preparedResults,
      githubUrl: 'https://github.com/itsisoev',
      githubText: 'Автор проекта: itsisoev',
    });

    return html;
  }
}
