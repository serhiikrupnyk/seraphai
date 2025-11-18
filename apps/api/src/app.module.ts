import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { RedisService } from './redis/redis.service';
import { RedisTestController } from './redis/redis-test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // важливо
      envFilePath: '.env', // читаємо .env з apps/api/
    }),

    TelegramModule,
    SupabaseModule,
    AuthModule,
  ],
  controllers: [AppController, RedisTestController],
  providers: [AppService, RedisService],
})
export class AppModule {}
