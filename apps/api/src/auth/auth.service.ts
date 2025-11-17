import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async loginWithTelegram(initData: string) {
    const params = new URLSearchParams(initData);

    // 1. Дістаємо hash, видаляємо його з набору
    const hash = params.get('hash');
    if (!hash) {
      throw new UnauthorizedException('Missing hash');
    }
    params.delete('hash');

    // 2. Формуємо data_check_string (key=value\n...) по алфавіту
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    // 3. secret_key = SHA256(bot_token)
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // 4. hmac = HMAC_SHA256(data_check_string, secret_key)
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    // 5. Якщо підпис валідний — дістаємо user
    const userJson = params.get('user');
    let user: any = null;

    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch (e) {
        throw new UnauthorizedException('Invalid user JSON');
      }
    }

    const authDate = params.get('auth_date');
    const queryId = params.get('query_id');

    if (!user || !user.id) {
      throw new UnauthorizedException('User data missing');
    }

    // 6. Upsert у Supabase
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('users')
      .upsert(
        {
          tg_id: user.id,
          username: user.username ?? null,
          first_name: user.first_name ?? null,
          last_name: user.last_name ?? null,
          language_code: user.language_code ?? null,
          is_premium: user.is_premium ?? null,
          photo_url: user.photo_url ?? null,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'tg_id',
        },
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error('Failed to upsert user in Supabase');
    }

    // 7. Генеруємо JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        sub: data.id, // id з таблиці users
        tg_id: data.tg_id,
        username: data.username,
      },
      jwtSecret,
      { expiresIn: '7d' },
    );

    return {
      ok: true,
      auth_date: authDate,
      query_id: queryId,
      tgUser: user,
      dbUser: data,
      token,
    };
  }
}
