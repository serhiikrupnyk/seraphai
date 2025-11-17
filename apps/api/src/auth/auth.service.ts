import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async loginWithTelegram(initData: string) {
    if (!initData) {
      throw new UnauthorizedException('Empty initData');
    }

    // 👇 DEBUG, щоб бачити, що реально прилітає
    console.log('INIT DATA RAW:', initData);

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

    console.log('DATA_CHECK_STRING:', dataCheckString);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is missing');

    // 3. secret_key = HMAC_SHA256(bot_token, "WebAppData")
    //   (ключ = "WebAppData", дані = botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest(); // ❗ без 'hex' — нам потрібен Buffer

    // 4. Підписуємо як HMAC-SHA256(data_check_string, secret_key)
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    console.log('Computed HMAC:', hmac);
    console.log('Received HASH:', hash);

    if (hmac.toLowerCase() !== hash.toLowerCase()) {
      console.error('❌ Invalid signature');
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

    const authDate = params.get('auth_date') ?? undefined;
    const queryId = params.get('query_id') ?? undefined;

    // (опційно) перевірка "свіжості" initData
    if (authDate) {
      const authTs = Number(authDate) * 1000;
      const maxAgeMs = 24 * 60 * 60 * 1000; // 24h
      if (Date.now() - authTs > maxAgeMs) {
        throw new UnauthorizedException('Auth data is too old');
      }
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

    // 8. Повертаємо відповідь (додаю auth_date / query_id, бо ти їх читаєш в контролері)
    return {
      ok: true,
      token,
      tgUser: user,
      dbUser: data,
      auth_date: authDate,
      query_id: queryId,
    };
  }
}
