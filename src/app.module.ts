import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { PublicAuditModule } from './public-audit/public-audit.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuditModule,
    PublicAuditModule,
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore.create({
          host: 'localhost',
          port: 6379,
          ttl: 600,
        }),
      }),
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
