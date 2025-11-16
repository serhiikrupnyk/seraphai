import { AuthService } from './auth.service';
import { TelegramAuthDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    telegramLogin(dto: TelegramAuthDto): Promise<{
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
