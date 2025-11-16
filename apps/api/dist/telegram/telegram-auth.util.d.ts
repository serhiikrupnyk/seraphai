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
export declare function verifyTelegramInitData(initData: string, botToken: string, maxAgeSeconds?: number): TelegramAuthResult;
