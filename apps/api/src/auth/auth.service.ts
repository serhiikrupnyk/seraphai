import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async loginWithTelegram(initData: string) {
    // initData приходить як query string (tgWebAppData)
    const params = new URLSearchParams(initData);

    const userJson = params.get('user');
    const authDate = params.get('auth_date');
    const queryId = params.get('query_id');

    let user: any = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch (e) {
        // поки що просто ігноруємо
      }
    }

    // TODO: перевірка підпису (hash)
    // TODO: upsert у Supabase (users)

    return {
      ok: true,
      query_id: queryId,
      auth_date: authDate,
      user,
    };
  }
}
