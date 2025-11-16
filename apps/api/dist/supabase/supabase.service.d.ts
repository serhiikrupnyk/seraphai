import { OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export interface TelegramUserPayload {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    photo_url?: string;
    is_premium?: boolean;
}
export declare class SupabaseService implements OnModuleInit {
    private client;
    onModuleInit(): void;
    getClient(): SupabaseClient<any, "public", "public", any, any>;
    upsertTelegramUser(payload: TelegramUserPayload): Promise<any>;
}
