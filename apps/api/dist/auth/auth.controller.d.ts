import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    telegram(initData: string): Promise<{
        user: any;
        meta: {
            ok: boolean;
            query_id: string | null;
            auth_date: string | null;
        };
    }>;
}
