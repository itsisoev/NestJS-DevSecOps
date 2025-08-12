import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { PublicAuditModule } from './public-audit/public-audit.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GithubModule } from './github/github.module';
import { PdfModule } from './pdf/pdf.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { NotificationsModule } from './notifications/notifications.module';

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
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    GithubModule,
    PdfModule,
    AnalyzerModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
