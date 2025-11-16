import { SupabaseService } from '../supabase/supabase.service';
import { TelegramAuthDto } from './auth.dto';
export declare class AuthService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    authWithTelegram(dto: TelegramAuthDto): Promise<{
        user: {
            id: any;
            tg_id: any;
            username: any;
            first_name: any;
            last_name: any;
            language_code: any;
            is_premium: any;
            created_at: any;
            last_login_at: any;
        };
    }>;
}
