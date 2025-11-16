import * as crypto from 'crypto';

export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramAuthResult {
  ok: boolean;
  error?: string;
  user?: TelegramWebAppUser;
}

/**
 * Перевіряє initData з Telegram WebApp згідно офіційної схеми:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400, // 24 години
): TelegramAuthResult {
  try {
    if (!initData) {
      return { ok: false, error: 'Empty initData' };
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const authDate = urlParams.get('auth_date');

    if (!hash || !authDate) {
      return { ok: false, error: 'Missing hash or auth_date' };
    }

    // Перевірка на "простроченість"
    const authTime = parseInt(authDate, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Number.isFinite(authTime) && now - authTime > maxAgeSeconds) {
      return { ok: false, error: 'Auth data is too old' };
    }

    // Формуємо data_check_string: всі key=value окрім hash, sort по key, join '\n'
    const data: string[] = [];
    urlParams.forEach((value, key) => {
      if (key === 'hash') return;
      data.push(`${key}=${value}`);
    });

    data.sort(); // сортуємо по key
    const dataCheckString = data.join('\n');

    // Секрет — SHA256(botToken)
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      return { ok: false, error: 'Hash mismatch (invalid initData)' };
    }

    // Якщо hash валідний — дістаємо user
    const rawUser = urlParams.get('user');
    if (!rawUser) {
      return { ok: false, error: 'No user field in initData' };
    }

    const user = JSON.parse(rawUser) as TelegramWebAppUser;
    return { ok: true, user };
  } catch (e) {
    console.error('verifyTelegramInitData error:', e);
    return { ok: false, error: 'Failed to parse initData' };
  }
}
