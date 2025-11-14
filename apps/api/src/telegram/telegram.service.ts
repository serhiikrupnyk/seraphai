import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const webAppUrl = process.env.WEBAPP_URL;

    this.bot = new TelegramBot(token, { polling: true });

    console.log('🤖 Telegram bot started (polling)…');

    // /start handler
    this.bot.onText(/\/start(?:\s+(.*))?/, (msg, match) => {
      const chatId = msg.chat.id;
      const payload = match && match[1] ? match[1] : null;

      console.log('Start payload:', payload);

      const opts: SendMessageOptions = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Open SeraphAI',
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      };

      this.bot.sendMessage(
        chatId,
        `Вітаю, ${msg.from?.first_name}! 👋\n\nНатисніть кнопку нижче, щоб запустити SeraphAI.`,
        opts,
      );
    });

    // Простий echo handler для тесту
    this.bot.on('message', (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        this.bot.sendMessage(msg.chat.id, `Ви написали: ${msg.text}`);
      }
    });
  }
}
