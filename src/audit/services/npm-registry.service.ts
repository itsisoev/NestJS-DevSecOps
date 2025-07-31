import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { NpmPackageData } from '../types/audit';

@Injectable()
export class NpmRegistryService {
  constructor(private readonly httpService: HttpService) {}

  async fetchPackageData(packageName: string): Promise<NpmPackageData | null> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<NpmPackageData>(
          `https://registry.npmjs.org/${packageName}`,
        ),
      );
      return response.data;
    } catch {
      return null;
    }
  }
}
