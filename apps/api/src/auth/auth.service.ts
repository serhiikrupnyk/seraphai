// auth.service.ts (фрагмент)

import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  private validateTelegramInitData(initData: string) {
    const params = new URLSearchParams(initData);

    const hash = params.get('hash');
    if (!hash) throw new UnauthorizedException('Missing hash');

    params.delete('hash');

    // Формуємо масив пар key=value
    const pairs: string[] = [];
    for (const [key, value] of params.entries()) {
      pairs.push(`${key}=${value}`);
    }

    // Сортуємо по ключу
    pairs.sort(); // лексикографічно: auth_date..., query_id..., user...

    const dataCheckString = pairs.join('\n');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('Missing TELEGRAM_BOT_TOKEN');

    console.log(
      'BOT_TOKEN_PREFIX:',
      botToken.slice(0, 10),
      'LEN=',
      botToken.length,
    );
    console.log('DATA_CHECK_STRING:', JSON.stringify(dataCheckString));
    console.log('HASH FROM TG:', hash);

    // Крок 1: secretKey = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest(); // Buffer

    // Крок 2: hmac(data_check_string, secretKey)
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    console.log('COMPUTED_HASH:', computedHash);

    if (computedHash.toLowerCase() !== hash.toLowerCase()) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }
  }

  async loginWithTelegram(initData: string) {
    if (!initData) throw new UnauthorizedException('Empty initData');

    console.log('INIT DATA RAW:', initData);

    // 1. Валідовуємо підпис
    this.validateTelegramInitData(initData);

    // 2. Дістаємо user
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) throw new UnauthorizedException('User not found');

    let user: any;
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      console.error('User JSON parse error:', e);
      throw new UnauthorizedException('Invalid user JSON');
    }

    if (!user.id) throw new UnauthorizedException('User ID missing');

    const authDate = params.get('auth_date') ?? null;
    const queryId = params.get('query_id') ?? null;

    // 3. Upsert у Supabase + JWT (твій код далі)
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
