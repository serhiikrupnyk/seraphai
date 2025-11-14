"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
let TelegramService = class TelegramService {
    bot;
    onModuleInit() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const webAppUrl = process.env.WEBAPP_URL;
        this.bot = new node_telegram_bot_api_1.default(token, { polling: true });
        console.log('🤖 Telegram bot started (polling)…');
        this.bot.onText(/\/start(?:\s+(.*))?/, (msg, match) => {
            const chatId = msg.chat.id;
            const payload = match && match[1] ? match[1] : null;
            console.log('Start payload:', payload);
            const opts = {
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
            this.bot.sendMessage(chatId, `Вітаю, ${msg.from?.first_name}! 👋\n\nНатисніть кнопку нижче, щоб запустити SeraphAI.`, opts);
        });
        this.bot.on('message', (msg) => {
            if (msg.text && !msg.text.startsWith('/')) {
                this.bot.sendMessage(msg.chat.id, `Ви написали: ${msg.text}`);
            }
        });
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)()
], TelegramService);
//# sourceMappingURL=telegram.service.js.map