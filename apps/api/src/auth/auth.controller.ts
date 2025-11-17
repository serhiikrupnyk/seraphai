import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegram(@Body('initData') initData: string) {
    if (!initData) {
      throw new BadRequestException('initData is required');
    }

    const result = await this.authService.loginWithTelegram(initData);

    return {
      user: result.dbUser, // дані з Supabase
      telegram: result.tgUser, // сирі дані з Telegram
      token: result.token, // JWT
      meta: {
        ok: result.ok,
        auth_date: result.auth_date,
        query_id: result.query_id,
      },
    };
  }
}
