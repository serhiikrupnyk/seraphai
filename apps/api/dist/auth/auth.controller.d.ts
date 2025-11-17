import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    telegram(initData: string): Promise<{
        user: any;
        telegram: any;
        token: string;
        meta: {
            ok: boolean;
            auth_date: string | null;
            query_id: string | null;
        };
    }>;
}
