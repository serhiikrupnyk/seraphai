import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async loginWithTelegram(initData: string) {
    if (!initData) throw new UnauthorizedException('Empty initData');

    console.log('INIT DATA RAW:', initData);

    const params = new URLSearchParams(initData);

    // 1. hash
    const hash = params.get('hash');
    if (!hash) throw new UnauthorizedException('Missing hash');
    params.delete('hash');

    // 2. data_check_string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    console.log('DATA_CHECK_STRING:', dataCheckString);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('Missing TELEGRAM_BOT_TOKEN');

    // ❗ CORRECT secret key for WebApp
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest(); // MUST be Buffer, NOT hex

    // 4. Compute HMAC
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    console.log('Computed HMAC:', hmac);
    console.log('Received HASH:', hash);

    if (hmac.toLowerCase() !== hash.toLowerCase()) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    // 5. Parse user
    const userJson = params.get('user');
    if (!userJson) throw new UnauthorizedException('User not found');

    let user: any;
    try {
      user = JSON.parse(userJson);
    } catch {
      throw new UnauthorizedException('Invalid user JSON');
    }

    if (!user.id) throw new UnauthorizedException('User ID missing');

    // 6. Upsert Supabase
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

    if (error) throw new Error('Supabase error: ' + error.message);

    // 7. JWT
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
    };
  }
}
