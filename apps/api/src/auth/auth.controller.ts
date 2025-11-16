import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramLogin(@Body() dto: TelegramAuthDto) {
    return this.authService.authWithTelegram(dto);
  }
}
