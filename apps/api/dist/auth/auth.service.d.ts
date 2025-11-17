import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    loginWithTelegram(initData: string): Promise<{
        ok: boolean;
        auth_date: string | null;
        query_id: string | null;
        tgUser: any;
        dbUser: any;
        token: string;
    }>;
}
