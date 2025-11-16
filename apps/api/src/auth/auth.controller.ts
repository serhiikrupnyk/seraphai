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
      user: result.user,
      meta: {
        ok: result.ok,
        query_id: result.query_id,
        auth_date: result.auth_date,
      },
    };
  }
}
