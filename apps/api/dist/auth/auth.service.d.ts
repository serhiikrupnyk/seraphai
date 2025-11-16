export declare class AuthService {
    loginWithTelegram(initData: string): Promise<{
        ok: boolean;
        query_id: string | null;
        auth_date: string | null;
        user: any;
    }>;
}
