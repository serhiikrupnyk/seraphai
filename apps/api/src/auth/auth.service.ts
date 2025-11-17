import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async loginWithTelegram(initData: string) {
    const params = new URLSearchParams(initData);

    // 1. Дістаємо hash
    const hash = params.get('hash');
    if (!hash) throw new UnauthorizedException('Missing hash');
    params.delete('hash');

    // 2. Формуємо data_check_string (в алфавітному порядку)
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is missing');

    // 3. secret_key = SHA256(bot_token)
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // 4. Підписуємо як HMAC-SHA256
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // ⚠️ Перевірка (Telegram інколи присилає uppercase)
    if (hmac.toLowerCase() !== hash.toLowerCase()) {
      console.error('❌ Invalid signature');
      console.error('Computed HMAC:', hmac);
      console.error('Received HASH:', hash);
      console.error('String:', dataCheckString);
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    // 5. Парсимо user JSON
    const userStr = params.get('user');
    if (!userStr) throw new UnauthorizedException('User not found');

    let user: any;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('User JSON parse error:', e);
      throw new UnauthorizedException('Invalid user JSON');
    }

    if (!user.id) throw new UnauthorizedException('User ID missing');

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
        { onConflict: 'tg_id' },
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to upsert user in Supabase');
    }

    // 7. Генеруємо JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET missing');

    const token = jwt.sign(
      {
        sub: data.id,
        tg_id: data.tg_id,
        username: data.username,
      },
      jwtSecret,
      { expiresIn: '7d' },
    );

    // 8. Повертаємо відповідь
    return {
      ok: true,
      token,
      tgUser: user,
      dbUser: data,
    };
  }
}
