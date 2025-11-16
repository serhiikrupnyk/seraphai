import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TelegramUserPayload {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !serviceRole) {
      throw new Error(
        'Supabase env vars not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE)',
      );
    }

    this.client = createClient(url, serviceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🟢 Supabase client initialized');
  }

  getClient() {
    return this.client;
  }

  /**
   * Створює/оновлює користувача з Telegram у таблиці users
   */
  async upsertTelegramUser(payload: TelegramUserPayload) {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('users')
      .upsert(
        {
          tg_id: payload.id,
          username: payload.username ?? null,
          first_name: payload.first_name ?? null,
          last_name: payload.last_name ?? null,
          language_code: payload.language_code ?? null,
          photo_url: payload.photo_url ?? null,
          is_premium: payload.is_premium ?? false,
          last_login_at: now,
        },
        {
          onConflict: 'tg_id',
        },
      )
      .select('*')
      .single();

    if (error) {
      console.error('Supabase upsertTelegramUser error:', error);
      throw new Error('Failed to upsert Telegram user in Supabase');
    }

    return data;
  }
}
