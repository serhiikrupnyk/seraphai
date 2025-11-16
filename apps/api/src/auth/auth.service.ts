import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TelegramAuthDto } from './auth.dto';
import { verifyTelegramInitData } from '../telegram/telegram-auth.util';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async authWithTelegram(dto: TelegramAuthDto) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    const { ok, error, user } = verifyTelegramInitData(dto.initData, botToken);

    if (!ok || !user) {
      throw new UnauthorizedException(error || 'Invalid Telegram initData');
    }

    // upsert user in Supabase
    const dbUser = await this.supabase.upsertTelegramUser({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      language_code: user.language_code,
      photo_url: user.photo_url,
      is_premium: user.is_premium,
    });

    // Повернемо мінімальний профіль (без нічого секретного)
    return {
      user: {
        id: dbUser.id,
        tg_id: dbUser.tg_id,
        username: dbUser.username,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        language_code: dbUser.language_code,
        is_premium: dbUser.is_premium,
        created_at: dbUser.created_at,
        last_login_at: dbUser.last_login_at,
      },
    };
  }
}
